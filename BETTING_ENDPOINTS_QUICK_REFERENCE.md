# Betting System Endpoints - Quick Reference

## Base Configuration
```
Base URL: ${NEXT_PUBLIC_API_BASE_URL}/api/payments/betting/user/
Auth: Bearer Token (JWT)
```

---

## 🎰 Platform Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/platforms/` | List all platforms |
| GET | `/platforms/{uid}/` | Get platform details |
| GET | `/platforms/platforms_with_permissions/` | Platforms with auth status |
| GET | `/platforms/platforms_with_stats/` | Platforms with statistics |

---

## 💰 Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions/my_transactions/` | List transactions (with filters) |
| POST | `/transactions/verify_user_id/` | Verify betting user ID |
| POST | `/transactions/create_deposit/` | Create deposit transaction |
| POST | `/transactions/create_withdrawal/` | Create withdrawal transaction |
| POST | `/transactions/{uid}/request_cancellation/` | Request cancellation |

### Transaction Filters
```
?status=pending|processing|success|failed|cancelled
&transaction_type=deposit|withdrawal
&platform={platform_uid}
&ordering=-created_at|amount
&page=1
```

---

## 🔄 Transfer UV Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfers/` | Create user-to-user transfer |
| GET | `/transfers/my_transfers/` | Get transfer history & stats |

### Transfer Request Body
```json
{
  "receiver_uid": "string",
  "amount": "string",
  "description": "string (optional)"
}
```

### Transfer Response
```json
{
  "summary": {
    "total_sent": 0,
    "total_received": 0,
    "amount_sent": 0,
    "amount_received": 0
  },
  "sent_transfers": [...],
  "received_transfers": [...]
}
```

### User Search Endpoint (for transfers)
```
GET /api/auth/users/search/?search={query}
```

---

## 💵 Commission Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/commissions/my_stats/` | Get commission statistics |
| GET | `/commissions/unpaid_commissions/` | Get unpaid commissions |
| GET | `/commissions/current_rates/` | Get current commission rates |
| GET | `/commissions/payment_history/` | Get payment history |

### Commission Stats Filters
```
?date_from=YYYY-MM-DD
&date_to=YYYY-MM-DD
```

---

## 🌐 External Platform Integration

| Endpoint | Description |
|----------|-------------|
| `GET https://api.blaffa.net/blaffa/app_name` | Get external platform data |

**Returns:** 
- Platform **images** (logo URLs in `image` field)
- Platform **addresses** (`city`, `street` fields)
- Tutorial content, deposit/withdrawal links
- Platform metadata (limits, status, etc.)

**Matching:** Use `BettingPlatform.external_id === ExternalPlatformData.id` to match

---

## 📱 USSD Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/networks/` | List mobile payment networks |
| GET | `/api/payments/user/transactions/` | List USSD transactions |
| POST | `/api/payments/user/transactions/` | Create USSD transaction |
| GET | `/api/payments/user/account/` | Get user account balance |
| POST | `/api/payments/user/account/transactions/` | Create account transaction (alternative) |

### Permission Required
- `can_process_ussd_transaction` - Must have this permission

### Network Response
```json
{
  "results": [{
    "uid": "string",
    "nom": "MTN",
    "country_name": "Côte d'Ivoire",
    "is_active": true
  }]
}
```

### Create USSD Transaction Request
```json
{
  "type": "deposit|withdrawal",
  "amount": 10000,
  "recipient_phone": "+225 0700000000",
  "network": "network_uid",
  "objet": "Optional description"
}
```

### USSD Transaction Statuses
- `pending` → `sent_to_user` → `processing` → `completed`/`success`
- Or: `failed`, `cancelled`, `timeout`

---

## 📋 Key Request/Response Examples

### 1. Verify User ID
```typescript
POST /transactions/verify_user_id/
Body: {
  platform_uid: "string",
  betting_user_id: "string"
}
Response: {
  UserId: number,
  Name: string,
  CurrencyId: number  // Must be 27
}
```

### 2. Create Deposit
```typescript
POST /transactions/create_deposit/
Body: {
  platform_uid: "string",
  betting_user_id: "string",
  amount: "string"
}
Response: {
  success: boolean,
  message: string,
  transaction: BettingTransaction
}
```

### 3. Create Withdrawal
```typescript
POST /transactions/create_withdrawal/
Body: {
  platform_uid: "string",
  betting_user_id: "string",
  withdrawal_code: "string"  // Generated on betting platform
}
Response: {
  success: boolean,
  message: string,
  transaction: BettingTransaction
}
```

### 4. Create Transfer
```typescript
POST /transfers/
Body: {
  receiver_uid: "string",
  amount: "string",
  description: "string"
}
Response: {
  success: boolean,
  message: string,
  transfer: Transfer
}
```

---

## ⚠️ Important Validation Rules

### User Verification
- `UserId` must not be 0
- `CurrencyId` must be 27

### Transaction Cancellation
- Only within 25 minutes of creation
- Cannot cancel already cancelled/failed
- Cannot cancel if already requested

### Amount Validation
- Deposit: Must be within platform `min_deposit_amount` and `max_deposit_amount`
- Withdrawal: Amount determined by `withdrawal_code`
- Transfer: Minimum amount typically 1 FCFA

---

## 📊 Status Values

### Transaction Status
- `pending` - Awaiting processing
- `processing` - Currently processing
- `success` - Successfully completed
- `failed` - Failed to process
- `cancelled` - Cancelled

### Transfer Status
- `pending` - Awaiting processing
- `processing` - Currently processing
- `completed` - Successfully completed
- `success` - Successfully completed (alias)
- `failed` - Failed to process
- `cancelled` - Cancelled

---

## 🔑 Authentication

### Token Refresh
```
POST /api/auth/token/refresh/
Body: { "refresh": "refresh_token" }
Response: { "access": "new_access_token" }
```

### Request Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## 📁 File Locations in Project

- **API Client:** `lib/api/betting.ts`
- **Type Definitions:** `lib/types/betting.ts`
- **Transfer Page:** `app/dashboard/transfer/page.tsx`
- **Deposit Page:** `app/dashboard/betting/deposit/page.tsx`
- **Withdrawal Page:** `app/dashboard/betting/withdrawal/page.tsx`
- **Transactions Page:** `app/dashboard/betting/transactions/page.tsx`
- **API Hook:** `lib/useApi.ts`

---

## 🚀 Quick Integration Steps

1. **Setup Environment**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
   ```

2. **Create API Hook**
   ```typescript
   import { useApi } from '@/lib/useApi'
   const apiFetch = useApi()
   ```

3. **Fetch Platforms**
   ```typescript
   const platforms = await apiFetch(`${baseUrl}/api/payments/betting/user/platforms/`)
   ```

4. **Verify User**
   ```typescript
   const verification = await apiFetch(`${baseUrl}/transactions/verify_user_id/`, {
     method: 'POST',
     body: JSON.stringify({ platform_uid, betting_user_id })
   })
   ```

5. **Create Transaction**
   ```typescript
   const transaction = await apiFetch(`${baseUrl}/transactions/create_deposit/`, {
     method: 'POST',
     body: JSON.stringify({ platform_uid, betting_user_id, amount })
   })
   ```

---

**Last Updated:** 2024  
**Version:** 1.0




