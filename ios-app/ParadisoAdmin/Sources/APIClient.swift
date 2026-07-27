import Foundation

actor APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(baseURL: URL = APIClient.configuredBaseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    static var configuredBaseURL: URL {
        let configured = Bundle.main.object(
            forInfoDictionaryKey: "PARADISO_API_BASE_URL"
        ) as? String
        return URL(string: configured ?? "https://loungebarparadiso.it")!
    }

    func login(email: String, password: String) async throws -> String {
        let response: LoginResponse = try await request(
            method: "POST",
            path: "/v1/auth/login",
            body: try encoder.encode(LoginRequest(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password))
        )
        return response.token
    }

    func bookings(token: String) async throws -> [Booking] {
        let response: BookingsResponse = try await request(
            method: "GET",
            path: "/v1/bookings?limit=300",
            token: token
        )
        return response.bookings
    }

    func bookingByCode(token: String, code: String) async throws -> Booking {
        var components = URLComponents()
        components.queryItems = [
            URLQueryItem(name: "q", value: code),
            URLQueryItem(name: "limit", value: "10")
        ]
        let response: BookingsResponse = try await request(
            method: "GET",
            path: "/v1/bookings?\(components.percentEncodedQuery ?? "")",
            token: token
        )
        guard let booking = response.bookings.first(where: {
            $0.code.caseInsensitiveCompare(code) == .orderedSame
        }) else {
            throw APIError(status: 404, message: "Prenotazione \(code) non trovata.")
        }
        return booking
    }

    func updateBookingStatus(token: String, bookingID: String, status: String) async throws {
        let _: EmptyResponse = try await request(
            method: "PATCH",
            path: "/v1/bookings/\(bookingID)/status",
            token: token,
            body: try encoder.encode(StatusRequest(status: status))
        )
    }

    func accounting(token: String, from: String, to: String) async throws -> (AccountingSummary, [LedgerEntry]) {
        let query = "?from=\(from)&to=\(to)"
        async let summary: AccountingSummary = request(
            method: "GET",
            path: "/v1/accounting/summary\(query)",
            token: token
        )
        async let entries: EntriesResponse = request(
            method: "GET",
            path: "/v1/accounting/entries\(query)",
            token: token
        )
        let (loadedSummary, loadedEntries) = try await (summary, entries)
        return (loadedSummary, loadedEntries.entries)
    }

    func createLedgerEntry(
        token: String,
        occurredOn: String,
        kind: String,
        category: String,
        description: String,
        paymentMethod: String,
        amount: Double
    ) async throws {
        let input = LedgerEntryRequest(
            occurredOn: occurredOn,
            kind: kind,
            category: category,
            description: description,
            paymentMethod: paymentMethod,
            amount: amount
        )
        let _: LedgerEntry = try await request(
            method: "POST",
            path: "/v1/accounting/entries",
            token: token,
            body: try encoder.encode(input)
        )
    }

    func registerBookingIncome(
        token: String,
        bookingID: String,
        amount: Double,
        occurredOn: String,
        paymentMethod: String
    ) async throws {
        let input = BookingIncomeRequest(
            amount: amount,
            occurredOn: occurredOn,
            paymentMethod: paymentMethod
        )
        let _: EmptyResponse = try await request(
            method: "POST",
            path: "/v1/accounting/bookings/\(bookingID)/register-income",
            token: token,
            body: try encoder.encode(input)
        )
    }

    func registerDevice(token: String, fid: String, deviceName: String) async throws {
        let _: EmptyResponse = try await request(
            method: "POST",
            path: "/v1/devices",
            token: token,
            body: try encoder.encode(DeviceRequest(fid: fid, deviceName: deviceName))
        )
    }

    private func request<Response: Decodable>(
        method: String,
        path: String,
        token: String? = nil,
        body: Data? = nil
    ) async throws -> Response {
        guard let url = URL(string: baseURL.absoluteString.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + path) else {
            throw APIError(status: 0, message: "Indirizzo del server non valido.")
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 15
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        do {
            let (data, response) = try await session.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError(status: 0, message: "Risposta del server non valida.")
            }
            guard (200...299).contains(httpResponse.statusCode) else {
                let envelope = try? decoder.decode(ErrorEnvelope.self, from: data)
                throw APIError(
                    status: httpResponse.statusCode,
                    message: envelope?.error.message ?? "Operazione non riuscita."
                )
            }
            let responseData = data.isEmpty ? Data("{}".utf8) : data
            return try decoder.decode(Response.self, from: responseData)
        } catch let error as APIError {
            throw error
        } catch is DecodingError {
            throw APIError(status: 0, message: "Il server ha restituito dati non validi.")
        } catch {
            throw APIError(status: 0, message: "Connessione al server non riuscita.")
        }
    }
}

struct APIError: LocalizedError {
    let status: Int
    let message: String
    var errorDescription: String? { message }
}

private struct LoginRequest: Encodable {
    let email: String
    let password: String
}

private struct LoginResponse: Decodable {
    let token: String
}

private struct BookingsResponse: Decodable {
    let bookings: [Booking]
}

private struct EntriesResponse: Decodable {
    let entries: [LedgerEntry]
}

private struct StatusRequest: Encodable {
    let status: String
}

private struct LedgerEntryRequest: Encodable {
    let occurredOn: String
    let kind: String
    let category: String
    let description: String
    let paymentMethod: String
    let amount: Double
}

private struct BookingIncomeRequest: Encodable {
    let amount: Double
    let occurredOn: String
    let paymentMethod: String
}

private struct DeviceRequest: Encodable {
    let fid: String
    let deviceName: String
}

private struct EmptyResponse: Decodable {}

private struct ErrorEnvelope: Decodable {
    let error: ErrorBody
}

private struct ErrorBody: Decodable {
    let message: String
}
