import { useApi } from "../useApi"
import {
  BettingPlatformsResponse,
  BettingPlatform,
  BettingPlatformsWithPermissionsResponse,
  BettingPlatformsWithStatsResponse,
  BettingTransactionsResponse,
  BettingCommissionStats,
  UnpaidCommissionsResponse,
  CommissionRates,
  CommissionPaymentHistoryResponse,
  DepositFormData,
  WithdrawalFormData,
  UserVerificationResponse,
  TransactionCreateResponse
} from "../types/betting"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Platform APIs
export const useBettingPlatforms = () => {
  const apiFetch = useApi()

  const getPlatforms = async (): Promise<BettingPlatformsResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/`
    return await apiFetch(endpoint)
  }

  const getPlatformDetail = async (platformUid: string): Promise<BettingPlatform> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/${platformUid}/`
    return await apiFetch(endpoint)
  }

  const getPlatformsWithPermissions = async (): Promise<BettingPlatformsWithPermissionsResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_permissions/`
    return await apiFetch(endpoint)
  }

  const getPlatformsWithStats = async (): Promise<BettingPlatformsWithStatsResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_stats/`
    return await apiFetch(endpoint)
  }

  return {
    getPlatforms,
    getPlatformDetail,
    getPlatformsWithPermissions,
    getPlatformsWithStats
  }
}

// Transaction APIs
export const useBettingTransactions = () => {
  const apiFetch = useApi()

  const getTransactions = async (params: {
    status?: string
    transaction_type?: string
    platform?: string
    ordering?: string
    page?: number
  } = {}): Promise<BettingTransactionsResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('status', params.status)
    if (params.transaction_type) searchParams.append('transaction_type', params.transaction_type)
    if (params.platform) searchParams.append('platform', params.platform)
    if (params.ordering) searchParams.append('ordering', params.ordering)
    if (params.page) searchParams.append('page', params.page.toString())

    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/my_transactions/?${searchParams.toString()}`
    return await apiFetch(endpoint)
  }

  const verifyUserId = async (platformUid: string, bettingUserId: string): Promise<UserVerificationResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/verify_user_id/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        platform_uid: platformUid,
        betting_user_id: bettingUserId
      })
    })
  }

  const createDeposit = async (data: DepositFormData): Promise<TransactionCreateResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/create_deposit/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
  }

  const createWithdrawal = async (data: WithdrawalFormData): Promise<TransactionCreateResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/create_withdrawal/`
    return await apiFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
  }

  return {
    getTransactions,
    verifyUserId,
    createDeposit,
    createWithdrawal
  }
}

// Commission APIs
export const useBettingCommissions = () => {
  const apiFetch = useApi()

  const getCommissionStats = async (params: {
    date_from?: string
    date_to?: string
  } = {}): Promise<BettingCommissionStats> => {
    const searchParams = new URLSearchParams()
    
    if (params.date_from) searchParams.append('date_from', params.date_from)
    if (params.date_to) searchParams.append('date_to', params.date_to)

    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/my_stats/?${searchParams.toString()}`
    return await apiFetch(endpoint)
  }

  const getUnpaidCommissions = async (): Promise<UnpaidCommissionsResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/unpaid_commissions/`
    return await apiFetch(endpoint)
  }

  const getCommissionRates = async (): Promise<CommissionRates> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/current_rates/`
    return await apiFetch(endpoint)
  }

  const getPaymentHistory = async (limit: number = 50): Promise<CommissionPaymentHistoryResponse> => {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/payment_history/?limit=${limit}`
    return await apiFetch(endpoint)
  }

  return {
    getCommissionStats,
    getUnpaidCommissions,
    getCommissionRates,
    getPaymentHistory
  }
}
