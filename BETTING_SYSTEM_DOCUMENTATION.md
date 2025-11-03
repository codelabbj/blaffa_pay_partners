# Betting System Integration & API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Betting Platform Endpoints](#betting-platform-endpoints)
3. [Transaction Endpoints](#transaction-endpoints)
4. [Transfer UV Endpoints](#transfer-uv-endpoints)
5. [Commission Endpoints](#commission-endpoints)
6. [External Platform Integration](#external-platform-integration)
7. [Type Definitions](#type-definitions)
8. [Authentication](#authentication)
9. [Implementation Notes](#implementation-notes)

---

## Overview

This betting system provides a comprehensive API for managing betting platforms, transactions (deposits/withdrawals), user transfers (UV), and commissions. The system integrates with external platforms and provides real-time transaction processing.

### Base URL Configuration
- Base URL is configured via `NEXT_PUBLIC_API_BASE_URL` environment variable
- All endpoints use the format: `${baseUrl}/api/payments/betting/user/{resource}/`

---

## Betting Platform Endpoints

### 1. Get Platforms List
**Endpoint:** `GET /api/payments/betting/user/platforms/`

**Description:** Retrieves all betting platforms available to the user.

**Response:**
```typescript
{
  count: number
  next: string | null
  previous: string | null
  results: BettingPlatform[]
}
```

**Platform Object:**
```typescript
{
  uid: string
  name: string
  logo: string | null
  is_active: boolean
  external_id: string
  min_deposit_amount: string
  max_deposit_amount: string
  min_withdrawal_amount: string
  max_withdrawal_amount: string
  description?: string
  can_deposit?: boolean
  can_withdraw?: boolean
  permission_is_active?: boolean
  granted_by_name?: string
  permission_granted_at?: string
}
```

### 2. Get Platform Detail
**Endpoint:** `GET /api/payments/betting/user/platforms/{platform_uid}/`

**Description:** Retrieves detailed information about a specific platform.

**Response:** Single `BettingPlatform` object

### 3. Get Platforms with Permissions
**Endpoint:** `GET /api/payments/betting/user/platforms/platforms_with_permissions/`

**Description:** Retrieves platforms with authorization status information.

**Response:**
```typescript
{
  total_platforms: number
  authorized_count: number
  unauthorized_count: number
  authorized_platforms: BettingPlatform[]
  unauthorized_platforms: BettingPlatform[]
  all_platforms: BettingPlatform[]
}
```

### 4. Get Platforms with Statistics
**Endpoint:** `GET /api/payments/betting/user/platforms/platforms_with_stats/`

**Description:** Retrieves platforms with transaction statistics.

**Response:**
```typescript
{
  summary: {
    total_platforms: number
    authorized_count: number
    unauthorized_count: number
    platforms_with_transactions: number
  }
  authorized_platforms: BettingPlatformWithStats[]
  unauthorized_platforms: BettingPlatformWithStats[]
}
```

---

## Transaction Endpoints

### 1. Get Transactions
**Endpoint:** `GET /api/payments/betting/user/transactions/my_transactions/`

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, success, failed, cancelled)
- `transaction_type` (optional): Filter by type (deposit, withdrawal)
- `platform` (optional): Filter by platform UID
- `ordering` (optional): Sort field (e.g., `-created_at`, `amount`)
- `page` (optional): Page number for pagination

**Response:**
```typescript
{
  count: number
  next: string | null
  previous: string | null
  results: BettingTransaction[]
}
```

**Transaction Object:**
```typescript
{
  uid: string
  reference: string
  partner_name: string
  platform_name: string
  transaction_type: 'deposit' | 'withdrawal'
  amount: string
  status: 'success' | 'pending' | 'failed' | 'cancelled' | 'processing'
  betting_user_id: string
  withdrawal_code: string | null
  external_transaction_id: string | null
  commission_rate: string
  commission_paid_at: string | null
  commission_amount: string
  commission_paid: boolean
  created_at: string
  external_response: any
  cancellation_requested_at: string | null
  cancelled_at: string | null
  partner_refunded: boolean
  partner_balance_before: string
  partner_balance_after: string
  notes?: string
  is_cancellable?: boolean
  can_request_cancellation?: boolean
}
```

### 2. Verify User ID
**Endpoint:** `POST /api/payments/betting/user/transactions/verify_user_id/`

**Description:** Verifies a betting user ID before creating a transaction.

**Request Body:**
```typescript
{
  platform_uid: string
  betting_user_id: string
}
```

**Response:**
```typescript
{
  UserId: number
  Name: string
  CurrencyId: number
}
```

**Validation Logic:**
- `UserId` must not be 0
- `CurrencyId` must be 27

### 3. Create Deposit
**Endpoint:** `POST /api/payments/betting/user/transactions/create_deposit/`

**Request Body:**
```typescript
{
  platform_uid: string
  betting_user_id: string
  amount: string
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  transaction: BettingTransaction
}
```

### 4. Create Withdrawal
**Endpoint:** `POST /api/payments/betting/user/transactions/create_withdrawal/`

**Request Body:**
```typescript
{
  platform_uid: string
  betting_user_id: string
  withdrawal_code: string
}
```

**Note:** The withdrawal code is generated by the user on the betting platform before requesting a withdrawal.

**Response:**
```typescript
{
  success: boolean
  message: string
  transaction: BettingTransaction
}
```

### 5. Request Transaction Cancellation
**Endpoint:** `POST /api/payments/betting/user/transactions/{transaction_uid}/request_cancellation/`

**Description:** Requests cancellation of a transaction. Can only be cancelled within 25 minutes of creation.

**Request Body:**
```typescript
{
  reason: string
}
```

**Cancellation Conditions:**
- Transaction must not be already cancelled or failed
- Cancellation must not have been requested before
- Transaction must be within 25 minutes of creation
- `is_cancellable` and `can_request_cancellation` must be true

**Response:**
```typescript
{
  success: boolean
  message: string
  transaction: BettingTransaction
}
```

---

## Transfer UV Endpoints

### Overview
Transfer UV (User-to-User Transfer) allows users to transfer funds between each other within the system.

### 1. Create Transfer
**Endpoint:** `POST /api/payments/betting/user/transfers/`

**Description:** Creates a new transfer between users.

**Request Body:**
```typescript
{
  receiver_uid: string
  amount: string
  description?: string
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  transfer: Transfer
}
```

**Transfer Object:**
```typescript
{
  uid: string
  reference: string
  sender: number
  sender_name: string
  sender_email: string
  receiver: number
  receiver_name: string
  receiver_email: string
  amount: string
  fees: string
  status: string // pending, processing, completed, success, failed, cancelled
  description: string
  sender_balance_before: string
  sender_balance_after: string
  receiver_balance_before: string
  receiver_balance_after: string
  completed_at: string | null
  failed_reason: string
  created_at: string
  updated_at: string
}
```

### 2. Get Transfer History
**Endpoint:** `GET /api/payments/betting/user/transfers/my_transfers/`

**Description:** Retrieves all transfers (sent and received) for the current user.

**Response:**
```typescript
{
  summary: {
    total_sent: number
    total_received: number
    amount_sent: number
    amount_received: number
  }
  sent_transfers: Transfer[]
  received_transfers: Transfer[]
}
```

### 3. User Search (for Transfer)
**Endpoint:** `GET /api/auth/users/search/?search={query}`

**Description:** Searches for users to send transfers to.

**Response:**
```typescript
{
  results: User[]
}

User = {
  uid: string
  display_name: string
}
```

---

## Commission Endpoints

### 1. Get Commission Statistics
**Endpoint:** `GET /api/payments/betting/user/commissions/my_stats/`

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response:**
```typescript
{
  total_transactions: number
  total_commission: string
  paid_commission: string
  unpaid_commission: string
  payable_commission: string
  payable_transaction_count: number
  current_month_commission: string
  current_month_transaction_count: number
  by_platform: {
    platform__name: string
    count: number
    total_commission: number
    unpaid_commission: number
  }[]
}
```

### 2. Get Unpaid Commissions
**Endpoint:** `GET /api/payments/betting/user/commissions/unpaid_commissions/`

**Response:**
```typescript
{
  total_unpaid_amount: number
  transaction_count: number
  transactions: UnpaidCommission[]
}
```

### 3. Get Commission Rates
**Endpoint:** `GET /api/payments/betting/user/commissions/current_rates/`

**Response:**
```typescript
{
  deposit_rate: number
  withdrawal_rate: number
  last_updated: string | null
  updated_by: string | null
  message: string
}
```

### 4. Get Payment History
**Endpoint:** `GET /api/payments/betting/user/commissions/payment_history/?limit={limit}`

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 50)

**Response:**
```typescript
{
  payment_count: number
  total_paid_amount: number
  payments: CommissionPayment[]
}
```

---

## External Platform Integration

### External Platform API
**Endpoint:** `GET https://api.blaffa.net/blaffa/app_name`

**Description:** Fetches external platform data including images, addresses, and metadata.

**Response:**
```typescript
{
  platforms: ExternalPlatformData[]
}
```

**External Platform Data:**
```typescript
{
  id: string
  name: string
  image: string  // Platform logo/image URL
  is_active: boolean
  order: number | null
  city: string  // Platform address - city
  street: string  // Platform address - street
  deposit_tuto_content: string
  deposit_link: string | null
  withdrawal_tuto_content: string
  withdrawal_link: string
  public_name: string
  minimun_deposit: number
  max_deposit: number
  minimun_with: number
  max_win: number
  why_withdrawal_fail: string | null
  enable: boolean
}
```

**Usage:** 
- **Images**: Use `image` field to display platform logos
- **Addresses**: Display `city` and `street` fields for platform location
- **Matching**: Match platforms using `BettingPlatform.external_id === ExternalPlatformData.id`

**Implementation Example:**
```typescript
// Fetch external platform data
const getExternalPlatformByExternalId = async (externalId: string) => {
  const externalData = await getExternalPlatforms()
  const platform = externalData.platforms.find(p => p.id === externalId)
  return platform || null
}

// Usage in component
const externalData = await getExternalPlatformByExternalId(platform.external_id)
if (externalData) {
  // Display image: externalData.image
  // Display city: externalData.city
  // Display street: externalData.street
}
```

---

## USSD Transaction System

### Overview
USSD (Unstructured Supplementary Service Data) transactions allow users to process mobile money transactions via USSD codes. This system requires special permissions.

### Permission Required
**`can_process_ussd_transaction`** - Users must have this permission to:
- View transaction pages
- Create USSD transactions
- Access transaction management features

**Permission Check:**
```typescript
const { hasPermission } = usePermissions()
if (!hasPermission('can_process_ussd_transaction')) {
  // Show access denied
}
```

### 1. Get Mobile Payment Networks
**Endpoint:** `GET /api/payments/networks/`

**Description:** Retrieves available mobile payment networks (MTN, Orange, etc.)

**Response:**
```typescript
{
  count: number
  next: string | null
  previous: string | null
  results: Network[]
}
```

**Network Object:**
```typescript
{
  uid: string
  nom: string  // Network name (e.g., "MTN", "Orange")
  country_name: string  // Country (e.g., "Côte d'Ivoire")
  is_active: boolean
}
```

**Usage:** Filter active networks: `results.filter(network => network.is_active)`

### 2. Get User Account
**Endpoint:** `GET /api/payments/user/account/`

**Description:** Retrieves user account balance and statistics.

**Response:**
```typescript
{
  balance: string
  formatted_balance: string  // e.g., "10,000 FCFA"
  total_recharged: number
  total_deposited: number
  total_withdrawn: number
  is_active: boolean
  is_frozen: boolean
  utilization_rate: number
}
```

### 3. List USSD Transactions
**Endpoint:** `GET /api/payments/user/transactions/`

**Query Parameters:**
- `page` (optional): Page number
- `page_size` (optional): Items per page (default: 10)
- `search` (optional): Search by reference, phone, or amount
- `status` (optional): Filter by status
- `type` (optional): Filter by type (`deposit`, `withdrawal`)
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `ordering` (optional): Sort field (e.g., `-created_at`, `amount`)

**Response:**
```typescript
{
  count: number
  next: string | null
  previous: string | null
  results: USSDTransaction[]
}
```

**USSD Transaction Object:**
```typescript
{
  uid: string
  reference: string
  type: 'deposit' | 'withdrawal'
  amount: string
  formatted_amount: string  // e.g., "10,000 FCFA"
  recipient_phone: string
  recipient_name: string | null
  display_recipient_name: string | null
  network: {
    uid: string
    nom: string
    country_name: string
  }
  status: string
  fees: string | null
  created_at: string
  updated_at: string
}
```

### 4. Create USSD Transaction
**Endpoint:** `POST /api/payments/user/transactions/`

**Request Body:**
```typescript
{
  type: 'deposit' | 'withdrawal'
  amount: number  // Amount in FCFA
  recipient_phone: string  // e.g., "+225 0700000000"
  network: string  // Network UID
  objet?: string  // Optional description
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  transaction: USSDTransaction
}
```

**Transaction Flow:**
1. User selects transaction type (deposit/withdrawal)
2. User enters amount
3. User enters recipient phone number
4. User selects network
5. System creates transaction
6. Status progression: `pending` → `sent_to_user` → `processing` → `completed`/`success`

### 5. USSD Transaction Statuses
- `pending`: Transaction created, awaiting processing
- `sent_to_user`: USSD code sent to user's phone
- `processing`: Transaction being processed by network
- `completed`: Transaction successfully completed
- `success`: Transaction successfully completed (alias)
- `failed`: Transaction failed
- `cancelled`: Transaction cancelled
- `timeout`: Transaction expired/timed out

### 6. Account Transactions (Alternative)
**Endpoint:** `GET /api/payments/user/account/transactions/`

**Description:** Alternative endpoint for account-specific transactions.

**Query Parameters:** Same as `/api/payments/user/transactions/`

**Endpoint:** `POST /api/payments/user/account/transactions/`

**Description:** Alternative endpoint for creating account transactions.

---

## USSD Transaction Implementation Notes

### 1. Permission-Based Access
- All USSD transaction features require `can_process_ussd_transaction` permission
- Permission is loaded from user data in localStorage
- Permission check is performed in components before rendering

### 2. Network Selection
- Only active networks are available for selection
- Networks are fetched when transaction creation modal opens
- Network UID is required for transaction creation

### 3. Transaction Creation Flow
1. **Permission Check**: Verify user has `can_process_ussd_transaction`
2. **Network Fetch**: Load available networks
3. **Form Fill**: User enters transaction details
4. **Validation**: Ensure amount > 0, phone valid, network selected
5. **Submission**: POST to `/api/payments/user/transactions/`
6. **Status Tracking**: Monitor transaction status updates

### 4. Phone Number Format
- Format: International format with country code
- Example: "+225 0700000000" (Côte d'Ivoire)
- Phone number validation is handled by backend

### 5. Transaction Filtering
- Support for multiple filter criteria:
  - Status: pending, sent_to_user, processing, completed, failed, cancelled, timeout
  - Type: deposit, withdrawal
  - Date range: date_from, date_to
  - Search: reference, phone, amount
- Sorting: by amount, date (ascending/descending)

### 6. Account Balance Updates
- Balance updates automatically after successful transactions
- Use `/api/payments/user/account/` to refresh balance
- Account statistics include: total_recharged, total_deposited, total_withdrawn

### 7. Error Handling
- Network errors: Display error message, allow retry
- Validation errors: Show field-specific errors
- Permission errors: Show access denied page

### 8. Real-time Updates (Future)
- WebSocket support for live transaction updates (currently commented out)
- Transaction status can be updated in real-time
- Account balance updates can be pushed via WebSocket

---

## Type Definitions

### Complete Type Reference

```typescript
// Platform Types
export interface BettingPlatform {
  uid: string
  name: string
  logo: string | null
  is_active: boolean
  external_id: string
  min_deposit_amount: string
  max_deposit_amount: string
  min_withdrawal_amount: string
  max_withdrawal_amount: string
  description?: string
  can_deposit?: boolean
  can_withdraw?: boolean
  permission_is_active?: boolean
  granted_by_name?: string
  permission_granted_at?: string
}

// Transaction Types
export interface BettingTransaction {
  uid: string
  reference: string
  partner_name: string
  platform_name: string
  transaction_type: 'deposit' | 'withdrawal'
  amount: string
  status: 'success' | 'pending' | 'failed' | 'cancelled' | 'processing'
  betting_user_id: string
  withdrawal_code: string | null
  external_transaction_id: string | null
  commission_rate: string
  commission_paid_at: string | null
  commission_amount: string
  commission_paid: boolean
  created_at: string
  external_response: any
  cancellation_requested_at: string | null
  cancelled_at: string | null
  partner_refunded: boolean
  partner_balance_before: string
  partner_balance_after: string
  notes?: string
  is_cancellable?: boolean
  can_request_cancellation?: boolean
}

// Transfer Types
export interface Transfer {
  uid: string
  reference: string
  sender: number
  sender_name: string
  sender_email: string
  receiver: number
  receiver_name: string
  receiver_email: string
  amount: string
  fees: string
  status: string
  description: string
  sender_balance_before: string
  sender_balance_after: string
  receiver_balance_before: string
  receiver_balance_after: string
  completed_at: string | null
  failed_reason: string
  created_at: string
  updated_at: string
}

// Form Types
export interface DepositFormData {
  platform_uid: string
  betting_user_id: string
  amount: string
}

export interface WithdrawalFormData {
  platform_uid: string
  betting_user_id: string
  withdrawal_code: string
}
```

---

## Authentication

### Token-Based Authentication
All endpoints require Bearer token authentication.

**Header:**
```
Authorization: Bearer {access_token}
```

### Token Refresh
**Endpoint:** `POST /api/auth/token/refresh/`

**Request Body:**
```typescript
{
  refresh: string // refresh token
}
```

**Response:**
```typescript
{
  access: string // new access token
}
```

### Implementation
The system uses `useApi()` hook which automatically:
1. Attaches access token to requests
2. Handles token expiration (401 errors)
3. Refreshes tokens automatically
4. Logs out user if refresh fails

---

## Implementation Notes

### 1. Deposit Flow
1. User selects a platform
2. User enters betting user ID
3. System verifies user ID via `/verify_user_id/`
4. Validation: `UserId !== 0` and `CurrencyId === 27`
5. User enters deposit amount
6. Amount must be within platform limits (min/max)
7. System creates deposit via `/create_deposit/`
8. Transaction is processed automatically

### 2. Withdrawal Flow
1. User selects a platform
2. User enters betting user ID
3. System verifies user ID
4. User enters withdrawal code (generated on betting platform)
5. System creates withdrawal via `/create_withdrawal/`
6. Amount is determined automatically from withdrawal code
7. Transaction is processed automatically

### 3. Transaction Cancellation
- Only available within 25 minutes of creation
- Cannot cancel already cancelled/failed transactions
- Requires cancellation reason
- Uses endpoint: `/transactions/{uid}/request_cancellation/`

### 4. Transfer UV Flow
1. User searches for recipient via `/api/auth/users/search/`
2. User selects recipient
3. User enters amount and optional description
4. System creates transfer via `/transfers/`
5. Balance is updated for both sender and receiver
6. Transfer status: pending → processing → completed/failed

### 5. Error Handling
- All errors return consistent format
- Use `extractErrorMessages()` utility for error extraction
- Network errors are handled by `useApi()` hook
- Transaction failures show error message from `external_response.error` or `notes`

### 6. External Platform Data
- External platform data is fetched from `https://api.blaffa.net/blaffa/app_name`
- Used to display location information (city, street)
- Matched with platforms using `external_id` field

### 7. Currency
- All amounts are in **FCFA** (West African CFA Franc)
- Currency ID for betting users: **27**
- Amounts are stored as strings to preserve precision

### 8. Status Values
**Transaction Statuses:**
- `pending`: Awaiting processing
- `processing`: Currently being processed
- `success`: Successfully completed
- `failed`: Failed to process
- `cancelled`: Cancelled by user or system

**Transfer Statuses:**
- `pending`: Awaiting processing
- `processing`: Currently being processed
- `completed`: Successfully completed
- `success`: Successfully completed (alias)
- `failed`: Failed to process
- `cancelled`: Cancelled

### 9. Commission System
- Commissions are calculated automatically on transactions
- Rates are configurable (deposit_rate, withdrawal_rate)
- Commissions can be paid out separately
- Commission payment history tracks all payouts

### 10. Pagination
- Most list endpoints support pagination
- Use `page` query parameter
- Response includes `count`, `next`, `previous`
- Default page size: 10 items per page

---

## Recent Updates & Features

### Transfer UV (Latest Feature)
- User-to-user transfer functionality
- Real-time balance updates
- Transfer history with filtering
- Statistics dashboard (sent/received)
- User search with debouncing (300ms)
- Support for fees on transfers

### Transaction Cancellation
- 25-minute cancellation window
- Cancellation request workflow
- Reason tracking
- Automatic refund processing

### External Platform Integration
- Location data display (city, street)
- External platform metadata
- Tutorial content integration

### Enhanced Filtering
- Multi-criteria filtering (status, type, platform, date range)
- Client-side and server-side filtering
- Sorting capabilities (amount, date)

### Real-time Statistics
- Transaction statistics per platform
- Commission statistics with date ranges
- Transfer statistics (sent/received amounts)

---

## Integration Checklist

When integrating this betting system into another project:

- [ ] Configure `NEXT_PUBLIC_API_BASE_URL` environment variable
- [ ] Implement authentication system with token refresh
- [ ] Create API client with `useApi()` hook pattern
- [ ] Set up type definitions for all entities
- [ ] Implement platform listing and selection
- [ ] Add user ID verification before transactions
- [ ] Implement deposit flow with amount validation
- [ ] Implement withdrawal flow with withdrawal code
- [ ] Add transaction listing with filtering
- [ ] Implement transaction cancellation (if needed)
- [ ] Add transfer UV functionality
- [ ] Integrate commission tracking and display
- [ ] Connect to external platform API for location data
- [ ] Set up error handling utilities
- [ ] Implement pagination for list endpoints
- [ ] Add real-time statistics dashboards

---

## Example API Client Implementation

```typescript
// lib/api/betting.ts
import { useApi } from "../useApi"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export const useBettingPlatforms = () => {
  const apiFetch = useApi()

  const getPlatforms = async () => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/`
    return await apiFetch(endpoint)
  }

  const getPlatformDetail = async (platformUid: string) => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/${platformUid}/`
    return await apiFetch(endpoint)
  }

  return { getPlatforms, getPlatformDetail }
}

export const useBettingTransactions = () => {
  const apiFetch = useApi()

  const getTransactions = async (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
    const endpoint = `${baseUrl}/api/payments/betting/user/transactions/my_transactions/?${searchParams}`
    return await apiFetch(endpoint)
  }

  const verifyUserId = async (platformUid: string, bettingUserId: string) => {
    const endpoint = `${baseUrl}/api/payments/betting/user/transactions/verify_user_id/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform_uid: platformUid, betting_user_id: bettingUserId })
    })
  }

  const createDeposit = async (data: DepositFormData) => {
    const endpoint = `${baseUrl}/api/payments/betting/user/transactions/create_deposit/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  }

  const createWithdrawal = async (data: WithdrawalFormData) => {
    const endpoint = `${baseUrl}/api/payments/betting/user/transactions/create_withdrawal/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  }

  return { getTransactions, verifyUserId, createDeposit, createWithdrawal }
}
```

---

## Support & Contact

For questions or issues regarding this betting system integration, refer to:
- API endpoint documentation
- TypeScript type definitions
- Error response formats
- Authentication requirements

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**System:** Blaffa Pay Partners Betting System




