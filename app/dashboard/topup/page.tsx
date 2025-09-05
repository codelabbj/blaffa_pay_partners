
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, Upload, Wallet, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserTopupPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [currentPage, setCurrentPage] = useState(1)
	const [topups, setTopups] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "status" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	const { t } = useLanguage()
	const itemsPerPage = 10
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi();
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [detailTopup, setDetailTopup] = useState<any | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState("")
	
	// Create topup modal state
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [createError, setCreateError] = useState("")
	const [formData, setFormData] = useState({
		amount: "",
		proof_image: null as File | null,
		proof_description: "",
		transaction_date: ""
	})

	// Fetch topups from API
	useEffect(() => {
		const fetchTopups = async () => {
			setLoading(true)
			setError("")
			try {
				const params = new URLSearchParams({
					page: currentPage.toString(),
					page_size: itemsPerPage.toString(),
				})
				if (searchTerm.trim() !== "") {
					params.append("search", searchTerm)
				}
				if (statusFilter !== "all") {
					params.append("status", statusFilter)
				}
				const orderingParam = sortField
					? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
					: ""
				const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/?${params.toString()}${orderingParam}`
				const data = await apiFetch(endpoint)
				setTopups(data.results || [])
				setTotalCount(data.count || 0)
				setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
			} catch (err: any) {
				const errorMessage = extractErrorMessages(err)
				setError(errorMessage)
				setTopups([])
				setTotalCount(0)
				setTotalPages(1)
				toast({ title: t("topup.failedToLoad"), description: errorMessage, variant: "destructive" })
			} finally {
				setLoading(false)
			}
		}
		fetchTopups()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "amount" | "created_at" | "status") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	// Fetch topup details
	const handleOpenDetail = async (uid: string) => {
		setDetailModalOpen(true)
		setDetailLoading(true)
		setDetailError("")
		setDetailTopup(null)
		try {
			// For demo, just find in topups
			const found = topups.find((t) => t.uid === uid)
			setDetailTopup(found)
			toast({ title: t("topup.detailLoaded"), description: t("topup.detailLoadedSuccessfully") })
		} catch (err: any) {
			setDetailError(extractErrorMessages(err))
			toast({ title: t("topup.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	const handleCloseDetail = () => {
		setDetailModalOpen(false)
		setDetailTopup(null)
		setDetailError("")
	}

	// Handle create topup
	const handleCreateTopup = async () => {
		setCreateLoading(true)
		setCreateError("")
		try {
			const formDataPayload = new FormData()
			formDataPayload.append("amount", formData.amount)
			if (formData.proof_image) {
				formDataPayload.append("proof_image", formData.proof_image)
			}
			formDataPayload.append("proof_description", formData.proof_description)
			if (formData.transaction_date) {
				formDataPayload.append("transaction_date", formData.transaction_date)
			}

			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/`
			await apiFetch(endpoint, {
				method: "POST",
				body: formDataPayload
			})
			
			toast({ title: t("topup.success"), description: t("topup.createdSuccessfully") })
			setCreateModalOpen(false)
			setFormData({
				amount: "",
				proof_image: null,
				proof_description: "",
				transaction_date: ""
			})
			// Refresh the list
			setCurrentPage(1)
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setCreateError(errorMessage)
			toast({ title: t("topup.createFailed"), description: errorMessage, variant: "destructive" })
		} finally {
			setCreateLoading(false)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setFormData(prev => ({ ...prev, proof_image: file }))
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "outline"
			case "approved":
				return "default"
			case "rejected":
				return "destructive"
			case "expired":
				return "secondary"
			default:
				return "secondary"
		}
	}

	const formatTimeRemaining = (timeRemaining: string) => {
		if (!timeRemaining) return "-"
		const seconds = parseFloat(timeRemaining)
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		return `${hours}h ${minutes}m`
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 overflow-x-hidden">
			<div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
				{/* Header Section */}
				<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/30 dark:border-gray-700/50 shadow-xl p-4 md:p-8">
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
						<div className="flex items-center gap-3 md:gap-4">
							<div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
								<Wallet className="h-6 w-6 md:h-8 md:w-8 text-white" />
							</div>
							<div>
								<h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
									{t("topup.title") || "My Top Up Requests"}
								</h1>
								<p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
									Manage your account recharge requests and track their status
								</p>
							</div>
						</div>
						<Button 
							onClick={() => setCreateModalOpen(true)}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 w-full lg:w-auto"
						>
							<Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
							{t("topup.createNew") || "Create New Request"}
						</Button>
					</div>
				</div>

				{/* Main Content Card */}
				<Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-white/30 dark:border-gray-700/50 p-4 md:p-6">
						<CardTitle className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
							<Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
							{t("topup.requestHistory") || "Request History"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 md:p-8">
						{/* Search & Filter Section */}
						<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/30 dark:border-gray-700/50 p-4 md:p-6 mb-6 md:mb-8">
							<div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center">
								<div className="relative flex-1 w-full">
									<Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
									<Input
										placeholder={t("topup.search") || "Search by reference or amount..."}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 md:pl-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg focus:shadow-xl transition-all duration-300 text-sm md:text-base"
									/>
								</div>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full lg:w-56 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg">
										<SelectValue placeholder={t("topup.allStatuses") || "All Statuses"} />
									</SelectTrigger>
									<SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl md:rounded-2xl shadow-xl">
										<SelectItem value="all">{t("topup.allStatuses") || "All Statuses"}</SelectItem>
										<SelectItem value="pending">{t("topup.pending") || "Pending"}</SelectItem>
										<SelectItem value="approved">{t("topup.approved") || "Approved"}</SelectItem>
										<SelectItem value="rejected">{t("topup.rejected") || "Rejected"}</SelectItem>
										<SelectItem value="expired">{t("topup.expired") || "Expired"}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Table Section */}
						<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/30 dark:border-gray-700/50 overflow-hidden shadow-lg">
							{loading ? (
								<div className="p-8 md:p-12 text-center">
									<div className="inline-flex items-center gap-2 md:gap-3 text-gray-600 dark:text-gray-400">
										<div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
										<span className="text-sm md:text-base">{t("common.loading")}</span>
									</div>
								</div>
							) : error ? (
								<ErrorDisplay
									error={error}
									onRetry={() => {
										setCurrentPage(1)
										setError("")
									}}
									variant="full"
									showDismiss={false}
								/>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-white/30 dark:border-gray-700/50">
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm">{t("topup.reference") || "Reference"}</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm">
													<Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold hover:bg-transparent text-xs md:text-sm">
														{t("topup.amount") || "Amount"}
														<ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
													</Button>
												</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm">
													<Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold hover:bg-transparent text-xs md:text-sm">
														{t("topup.status") || "Status"}
														<ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
													</Button>
												</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm hidden md:table-cell">
													<Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold hover:bg-transparent text-xs md:text-sm">
														{t("topup.createdAt") || "Created At"}
														<ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
													</Button>
												</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm hidden lg:table-cell">{t("topup.expiresAt") || "Expires At"}</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm hidden lg:table-cell">{t("topup.timeRemaining") || "Time Remaining"}</TableHead>
												<TableHead className="text-left font-semibold text-gray-900 dark:text-white py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm">{t("common.actions") || "Actions"}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{topups.length === 0 ? (
												<TableRow>
													<TableCell colSpan={7} className="text-center py-8 md:py-12">
														<div className="flex flex-col items-center gap-3 md:gap-4 text-gray-500 dark:text-gray-400">
															<Wallet className="h-8 w-8 md:h-12 md:w-12 opacity-50" />
															<p className="text-base md:text-lg font-medium">{t("topup.noRequests") || "No top-up requests found"}</p>
															<p className="text-xs md:text-sm">Create your first top-up request to get started</p>
														</div>
													</TableCell>
												</TableRow>
											) : (
												topups.map((topup) => (
													<TableRow key={topup.uid} className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 border-b border-white/20 dark:border-gray-700/30">
														<TableCell className="py-3 md:py-4 px-3 md:px-6">
															<span className="font-mono text-xs md:text-sm bg-gray-100/80 dark:bg-gray-800/80 px-2 md:px-3 py-1 rounded-lg md:rounded-xl">
																{topup.reference}
															</span>
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6">
															<span className="font-semibold text-sm md:text-lg text-gray-900 dark:text-white">
																{topup.formatted_amount}
															</span>
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6">
															<Badge variant={getStatusBadgeVariant(topup.status)} className="rounded-lg md:rounded-xl px-2 md:px-3 py-1 text-xs">
																{topup.status === "pending" && <Clock className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
																{topup.status === "approved" && <CheckCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
																{topup.status === "rejected" && <XCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
																{topup.status === "expired" && <AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
																<span className="hidden sm:inline">{topup.status_display || topup.status}</span>
																<span className="sm:hidden">{topup.status_display?.charAt(0) || topup.status.charAt(0)}</span>
															</Badge>
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden md:table-cell">
															{topup.created_at ? new Date(topup.created_at).toLocaleDateString() : "-"}
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden lg:table-cell">
															{topup.expires_at ? new Date(topup.expires_at).toLocaleDateString() : "-"}
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
															{topup.is_expired ? (
																<Badge variant="destructive" className="rounded-lg md:rounded-xl text-xs">
																	<AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />
																	{t("topup.expired") || "Expired"}
																</Badge>
															) : (
																<span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 px-2 md:px-3 py-1 rounded-lg md:rounded-xl">
																	{formatTimeRemaining(topup.time_remaining)}
																</span>
															)}
														</TableCell>
														<TableCell className="py-3 md:py-4 px-3 md:px-6">
															<Button 
																size="sm" 
																variant="outline" 
																onClick={() => handleOpenDetail(topup.uid)}
																className="rounded-xl md:rounded-2xl border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
															>
																<span className="hidden sm:inline">{t("topup.viewDetails") || "View Details"}</span>
																<span className="sm:hidden">View</span>
															</Button>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							)}
						</div>

						{/* Pagination Section */}
						{totalPages > 1 && (
							<div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 mt-6 md:mt-8 p-4 md:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/30 dark:border-gray-700/50">
								<div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
									{`${t("topup.showingResults") || "Showing"}: ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} / ${totalCount}`}
								</div>
								<div className="flex items-center gap-2 md:gap-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
										className="rounded-xl md:rounded-2xl border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
									>
										<ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
										<span className="hidden sm:inline">{t("common.previous")}</span>
										<span className="sm:hidden">Prev</span>
									</Button>
									<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-3 md:px-4 py-1 md:py-2 rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50">
										{`${t("topup.pageOf") || "Page"}: ${currentPage}/${totalPages}`}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
										disabled={currentPage === totalPages}
										className="rounded-xl md:rounded-2xl border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
									>
										<span className="hidden sm:inline">{t("common.next")}</span>
										<span className="sm:hidden">Next</span>
										<ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Create Topup Modal */}
			<Dialog open={createModalOpen} onOpenChange={(open) => { 
				if (!open) {
					setCreateModalOpen(false)
					setCreateError("")
					setFormData({
						amount: "",
						proof_image: null,
						proof_description: "",
						transaction_date: ""
					})
				}
			}}>
				<DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl md:rounded-3xl shadow-2xl mx-4 sm:mx-0">
					<DialogHeader className="pb-4 md:pb-6">
						<DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
							<Plus className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
							{t("topup.createNew") || "Create New Top-Up Request"}
						</DialogTitle>
					</DialogHeader>
					
					{createError && (
						<ErrorDisplay
							error={createError}
							variant="inline"
							showRetry={false}
							className="mb-6"
						/>
					)}

					<div className="space-y-4 md:space-y-6">
						<div>
							<Label htmlFor="amount" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.amount") || "Amount"} *
							</Label>
							<Input
								id="amount"
								type="number"
								placeholder="Enter amount (e.g., 50000)"
								value={formData.amount}
								onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
								required
								className="h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg focus:shadow-xl transition-all duration-300 text-sm md:text-base"
							/>
						</div>

						<div>
							<Label htmlFor="proof_image" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.proofImage") || "Proof Image"}
							</Label>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
								<Input
									id="proof_image"
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="flex-1 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg text-sm"
								/>
								{formData.proof_image && (
									<Badge variant="outline" className="rounded-xl md:rounded-2xl px-2 md:px-3 py-1 md:py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 text-xs">
										<span className="truncate max-w-32 md:max-w-none">{formData.proof_image.name}</span>
									</Badge>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="proof_description" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.proofDescription") || "Proof Description"}
							</Label>
							<Textarea
								id="proof_description"
								placeholder="Describe your payment proof..."
								value={formData.proof_description}
								onChange={(e) => setFormData(prev => ({ ...prev, proof_description: e.target.value }))}
								rows={3}
								className="rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg focus:shadow-xl transition-all duration-300 text-sm md:text-base"
							/>
						</div>

						<div>
							<Label htmlFor="transaction_date" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.transactionDate") || "Transaction Date"}
							</Label>
							<Input
								id="transaction_date"
								type="date"
								value={formData.transaction_date}
								onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
								className="h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-lg focus:shadow-xl transition-all duration-300 text-sm md:text-base"
							/>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 md:mt-8">
						<DialogClose asChild>
							<Button 
								variant="outline" 
								disabled={createLoading}
								className="rounded-xl md:rounded-2xl border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-300 text-sm md:text-base px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
							>
								{t("common.cancel") || "Cancel"}
							</Button>
						</DialogClose>
						<Button 
							onClick={handleCreateTopup} 
							disabled={createLoading || !formData.amount}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
						>
							{createLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									{t("common.creating") || "Creating..."}
								</>
							) : (
								t("common.create") || "Create"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Topup Details Modal */}
			<Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
				<DialogContent className="sm:max-w-[700px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl md:rounded-3xl shadow-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
					<DialogHeader className="pb-4 md:pb-6">
						<DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
							<Wallet className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
							{t("topup.details") || "Top Up Request Details"}
						</DialogTitle>
					</DialogHeader>
					{detailLoading ? (
						<div className="p-6 md:p-8 text-center">
							<div className="inline-flex items-center gap-2 md:gap-3 text-gray-600 dark:text-gray-400">
								<div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
								<span className="text-sm md:text-base">{t("common.loading")}</span>
							</div>
						</div>
					) : detailError ? (
						<ErrorDisplay
							error={detailError}
							variant="inline"
							showRetry={false}
							className="mb-4 md:mb-6"
						/>
					) : detailTopup ? (
						<div className="space-y-4 md:space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
								<div className="space-y-3 md:space-y-4">
									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.reference") || "Reference"}
										</Label>
										<div className="flex items-center gap-2">
											<span className="font-mono text-xs md:text-sm bg-gray-100/80 dark:bg-gray-800/80 px-2 md:px-3 py-1 rounded-lg md:rounded-xl">
												{detailTopup.reference}
											</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
												onClick={() => {
													navigator.clipboard.writeText(detailTopup.reference)
													toast({ title: t("topup.copiedReference") || "Reference copied!" })
												}}
											>
												<Copy className="h-3 w-3 md:h-4 md:w-4" />
											</Button>
										</div>
									</div>
									
									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.amount") || "Amount"}
										</Label>
										<p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
											{detailTopup.formatted_amount}
										</p>
									</div>
									
									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.status") || "Status"}
										</Label>
										<div>
											<Badge variant={getStatusBadgeVariant(detailTopup.status)} className="rounded-lg md:rounded-xl px-2 md:px-3 py-1 text-xs">
												{detailTopup.status === "pending" && <Clock className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "approved" && <CheckCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "rejected" && <XCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "expired" && <AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status_display || detailTopup.status}
											</Badge>
										</div>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.createdAt") || "Created At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.created_at ? new Date(detailTopup.created_at).toLocaleString() : "-"}
										</p>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.expiresAt") || "Expires At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.expires_at ? new Date(detailTopup.expires_at).toLocaleString() : "-"}
										</p>
									</div>
								</div>

								<div className="space-y-3 md:space-y-4">
									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.timeRemaining") || "Time Remaining"}
										</Label>
										<p>
											{detailTopup.is_expired ? (
												<Badge variant="destructive" className="rounded-lg md:rounded-xl text-xs">
													<AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />
													{t("topup.expired") || "Expired"}
												</Badge>
											) : (
												<span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 px-2 md:px-3 py-1 rounded-lg md:rounded-xl">
													{formatTimeRemaining(detailTopup.time_remaining)}
												</span>
											)}
										</p>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.transactionDate") || "Transaction Date"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.transaction_date ? new Date(detailTopup.transaction_date).toLocaleDateString() : "-"}
										</p>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.canSubmitProof") || "Can Submit Proof"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.can_submit_proof ? t("common.yes") || "Yes" : t("common.no") || "No"}
										</p>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.reviewedAt") || "Reviewed At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.reviewed_at ? new Date(detailTopup.reviewed_at).toLocaleString() : "-"}
										</p>
									</div>

									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.processedAt") || "Processed At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.processed_at ? new Date(detailTopup.processed_at).toLocaleString() : "-"}
										</p>
									</div>
								</div>
							</div>

							{detailTopup.proof_description && (
								<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 dark:border-gray-700/50 p-3 md:p-4">
									<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
										{t("topup.proofDescription") || "Proof Description"}
									</Label>
									<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
										{detailTopup.proof_description}
									</p>
								</div>
							)}

							{detailTopup.rejection_reason && (
								<div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-red-200/50 dark:border-red-800/50 p-3 md:p-4">
									<Label className="text-xs md:text-sm font-semibold text-red-900 dark:text-red-200 mb-2 block">
										{t("topup.rejectionReason") || "Rejection Reason"}
									</Label>
									<p className="text-xs md:text-sm text-red-800 dark:text-red-200 mt-1">
										{detailTopup.rejection_reason}
									</p>
								</div>
							)}

							{detailTopup.admin_notes && (
								<div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-3 md:p-4">
									<Label className="text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 block">
										{t("topup.adminNotes") || "Admin Notes"}
									</Label>
									<p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 mt-1">
										{detailTopup.admin_notes}
									</p>
								</div>
							)}
						</div>
					) : null}
					<DialogClose asChild>
						<Button className="mt-4 md:mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl md:rounded-2xl text-sm md:text-base py-2 md:py-3">
							{t("common.close") || "Close"}
						</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>
		</div>
	)
}