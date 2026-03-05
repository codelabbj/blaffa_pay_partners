"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import * as XLSX from "xlsx"
import {
    FileSpreadsheet,
    Upload,
    Trash2,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Info,
    ArrowLeft,
    RefreshCw,
    Send,
    Plus,
    Clock,
    Search,
    LayoutGrid,
    FileText,
    ShieldCheck,
    Shield,
    Download,
    MoreVertical,
    List,
    TrendingUp,
    DollarSign,
    Eye,
    RotateCcw,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { extractErrorMessages } from "@/components/ui/error-display"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/components/providers/permissions-provider"

interface PaymentRow {
    id: string
    amount: string
    recipient_phone: string
    network: string // UID
    objet: string
    external_id: string | null
    error?: string
}

const ITEMS_PER_PAGE = 10

type ViewState = 'list' | 'create' | 'details' | 'summary' | 'transactions'

export default function BulkPaymentPage() {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { hasPermission, isLoading: permissionsLoading } = usePermissions()

    const [activeView, setActiveView] = useState<ViewState>('list')
    const [networks, setNetworks] = useState<any[]>([])
    const [rows, setRows] = useState<PaymentRow[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoadingNetworks, setIsLoadingNetworks] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [batches, setBatches] = useState<any[]>([])

    const addNewRow = (count = 1) => {
        const newRows: PaymentRow[] = Array.from({ length: count }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            amount: "",
            recipient_phone: "",
            network: "",
            objet: t("bulkPayment.title"),
            external_id: null
        }))
        setRows(prev => [...prev, ...newRows])
    }
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState<any>(null)
    const [batchDetails, setBatchDetails] = useState<any[]>([])
    const [isLoadingBatchDetails, setIsLoadingBatchDetails] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const [filters, setFilters] = useState({
        status: "all",
        search: "",
        date_from: "",
        date_to: "",
        network: "all",
        page: 1
    })
    const [totalCount, setTotalCount] = useState(0)

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    useEffect(() => {
        fetchNetworks()
        fetchBatches()
    }, [])

    const fetchNetworks = async () => {
        setIsLoadingNetworks(true)
        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/networks/?limit=100`
            const data = await apiFetch(endpoint)
            setNetworks(data.networks || data.results || [])
        } catch (err) {
            toast.error(t("payment.failedToLoadNetworks"))
        } finally {
            setIsLoadingNetworks(false)
        }
    }

    const fetchBatches = async (currentFilters = filters) => {
        setIsLoadingBatches(true)
        const params = new URLSearchParams()
        if (currentFilters.status !== "all") params.append("status", currentFilters.status)
        if (currentFilters.search) params.append("search", currentFilters.search)
        if (currentFilters.date_from) params.append("date_from", currentFilters.date_from)
        if (currentFilters.date_to) params.append("date_to", currentFilters.date_to)
        if (currentFilters.network !== "all") params.append("network", currentFilters.network)
        params.append("page", currentFilters.page.toString())
        params.append("page_size", ITEMS_PER_PAGE.toString())

        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/list/?${params.toString()}`
            const data = await apiFetch(endpoint)
            const results = data.results || (Array.isArray(data) ? data : [])
            setBatches(results)
            setTotalCount(data.count || (Array.isArray(results) ? results.length : 0))
        } catch (err) {
            toast.error(t("common.failedToLoad"))
        } finally {
            setIsLoadingBatches(false)
        }
    }

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value, page: 1 }
        setFilters(newFilters)
        fetchBatches(newFilters)
    }

    const resetFilters = () => {
        const defaults = { status: "all", search: "", date_from: "", date_to: "", network: "all", page: 1 }
        setFilters(defaults)
        fetchBatches(defaults)
    }

    const fetchBatchSummary = async (batch: any) => {
        setSelectedBatch(batch)
        setIsLoadingBatchDetails(true)
        setActiveView('summary')
        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/${batch.uid}/`
            const data = await apiFetch(endpoint)
            setSelectedBatch(data)
        } catch (err) {
            toast.error(t("common.failedToLoad"))
        } finally {
            setIsLoadingBatchDetails(false)
        }
    }

    const fetchBatchTransactionsList = async (batch: any) => {
        setSelectedBatch(batch)
        setIsLoadingBatchDetails(true)
        setActiveView('transactions')
        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/${batch.uid}/transactions/`
            const data = await apiFetch(endpoint)
            const details = data.results || (Array.isArray(data) ? data : [])
            setBatchDetails(details)
        } catch (err) {
            toast.error(t("common.failedToLoad"))
        } finally {
            setIsLoadingBatchDetails(false)
        }
    }

    const validateRow = (row: PaymentRow): string | undefined => {
        if (!row.amount || isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
            return t("bulkPayment.invalidAmount")
        }
        const phoneClean = row.recipient_phone.replace(/\D/g, "")
        if (phoneClean.length < 10) {
            return t("bulkPayment.minDigits")
        }
        if (!row.network) {
            return t("payment.selectNetwork")
        }
        const network = networks.find(n => n.uid === row.network)
        if (network) {
            const amt = Number(row.amount)
            if (network.min_montant && amt < network.min_montant) {
                return `${t("bulkPayment.min")}: ${network.min_montant}`
            }
            if (network.max_montant && amt > network.max_montant) {
                return `${t("bulkPayment.max")}: ${network.max_montant}`
            }
        }
        return undefined
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = event.target?.result
                const workbook = XLSX.read(data, { type: "binary" })
                const sheetName = workbook.SheetNames[0]
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
                const newRows: PaymentRow[] = json.map((row: any) => {
                    const findValue = (keywords: string[]) => {
                        const key = Object.keys(row).find(k =>
                            keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))
                        )
                        return key ? row[key] : null
                    }

                    const amount = String(findValue(['montant', 'amount']) || "")
                    const phone = String(findValue(['numero', 'numéro', 'phone', 'telephone']) || "")
                    const objetValue = String(findValue(['objet', 'object', 'description']) || t("bulkPayment.title"))
                    const networkValue = String(findValue(['reseau', 'réseau', 'network', 'code']) || "").trim().toLowerCase()

                    // Try to find matching network by code, name or UID
                    const matchedNetwork = networks.find(n =>
                        n.code?.toLowerCase() === networkValue ||
                        n.nom?.toLowerCase() === networkValue ||
                        n.uid === networkValue ||
                        (n.code?.toLowerCase().includes(networkValue) && networkValue.length > 2)
                    )

                    const paymentRow: PaymentRow = {
                        id: Math.random().toString(36).substr(2, 9),
                        amount,
                        recipient_phone: phone,
                        network: matchedNetwork?.uid || "",
                        objet: objetValue,
                        external_id: findValue(['external', 'externe', 'reference']) || null
                    }
                    paymentRow.error = validateRow(paymentRow)
                    return paymentRow
                })
                setRows(prev => [...prev, ...newRows])
                toast.success(t("bulkPayment.transactionsImported", { count: newRows.length }))
            } catch (err) {
                toast.error(t("bulkPayment.importError"))
            }
        }
        reader.readAsBinaryString(file)
        e.target.value = ""
    }

    const handleSubmit = async () => {
        const hasErrors = rows.some(r => !!r.error)
        if (hasErrors || rows.length === 0) {
            toast.error(t("bulkPayment.correctionRequired"))
            return
        }
        setIsConfirmOpen(true)
    }

    const confirmSend = async () => {
        setIsConfirmOpen(false)
        setIsSubmitting(true)
        try {
            const payload = rows.map(r => ({
                amount: String(r.amount),
                recipient_phone: r.recipient_phone,
                network: r.network,
                objet: r.objet,
                external_id: r.external_id || null
            }))
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/`
            await apiFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            toast.success(t("payment.transactionCreatedSuccessfully"))
            setRows([])
            setActiveView('list')
            fetchBatches()
        } catch (err: any) {
            toast.error(t("payment.failedToCreateTransaction"), { description: extractErrorMessages(err) })
        } finally {
            setIsSubmitting(false)
        }
    }

    const StatusBadge = ({ status }: { status: string }) => {
        const isCompleted = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success' || !!status.match(/traité/i) || status === t("bulkPayment.success")
        const isFailed = status.toLowerCase() === 'failed' || !!status.match(/échoué/i) || status === t("bulkPayment.failed")

        let displayStatus = status
        if (status.toLowerCase() === 'success' || status.toLowerCase() === 'completed') displayStatus = t("bulkPayment.success")
        if (status.toLowerCase() === 'failed') displayStatus = t("bulkPayment.failed")
        if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'processing') displayStatus = t("bulkPayment.processing")

        return (
            <Badge variant="secondary" className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    isFailed ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
                {displayStatus}
            </Badge>
        )
    }

    const renderListView = () => {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {!isLoadingNetworks && networks.length === 0 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                            <h4 className="font-bold text-destructive text-sm leading-none mb-1">{t("bulkPayment.correctionRequired") || "Attention"}</h4>
                            <p className="text-xs text-destructive/80 font-medium">
                                {t("bulkPayment.notAuthorized")}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("bulkPayment.title")}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{t("bulkPayment.subtitle")}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.open('https://docs.google.com/spreadsheets/d/1hBrbWLD_qTtiLBq6JBWc_IOoSTdzX__hZ-yLgxM59v4/edit?usp=sharing', '_blank')}
                            className="rounded-lg h-10 px-5 font-medium border-border w-full sm:w-auto"
                        >
                            <Download className="mr-2 h-4 w-4" /> {t("bulkPayment.downloadSample")}
                        </Button>
                        <Button
                            disabled={!isLoadingNetworks && (networks.length === 0 || (!permissionsLoading && !hasPermission('can_process_bulk_payment')))}
                            onClick={() => {
                                setRows([])
                                addNewRow(5)
                                setCurrentPage(1)
                                setActiveView('create')
                            }}
                            className="rounded-lg h-10 px-5 font-semibold transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t("bulkPayment.newBatch")}
                        </Button>
                    </div>
                </div>

                <Card className="border-border shadow-none bg-muted/5">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t("users.search")}</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("bulkPayment.searchPlaceholder")}
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange("search", e.target.value)}
                                        className="pl-9 h-10 rounded-lg border-border bg-background"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t("bulkPayment.status")}</Label>
                                <Select value={filters.status} onValueChange={(val) => handleFilterChange("status", val)}>
                                    <SelectTrigger className="h-10 rounded-lg border-border bg-background">
                                        <SelectValue placeholder={t("bulkPayment.status")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("bulkPayment.allBatches")}</SelectItem>
                                        <SelectItem value="success">{t("bulkPayment.completed")}</SelectItem>
                                        <SelectItem value="pending">{t("bulkPayment.processing")}</SelectItem>
                                        <SelectItem value="failed">{t("bulkPayment.failed")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t("bulkPayment.dateFrom")}</Label>
                                <Input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange("date_from", e.target.value)}
                                    className="h-10 rounded-lg border-border bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t("bulkPayment.dateTo")}</Label>
                                <Input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange("date_to", e.target.value)}
                                    className="h-10 rounded-lg border-border bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t("bulkPayment.network")}</Label>
                                <Select value={filters.network} onValueChange={(val) => handleFilterChange("network", val)}>
                                    <SelectTrigger className="h-10 rounded-lg border-border bg-background">
                                        <SelectValue placeholder={t("bulkPayment.network")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("common.all") || "All Networks"}</SelectItem>
                                        {networks.map(n => (
                                            <SelectItem key={n.uid} value={n.uid}>
                                                <div className="flex items-center gap-2">
                                                    {n.logo && <img src={n.logo} className="w-4 h-4 rounded-sm" alt="" />}
                                                    <span>{n.nom}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[900px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.date")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.totalCount")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.amount")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.progress")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground text-center">{t("bulkPayment.status")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground text-right">{t("bulkPayment.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingBatches ? (
                                    <TableRow><TableCell colSpan={5} className="h-64 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground/40" /></TableCell></TableRow>
                                ) : batches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-96 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="p-4 bg-muted rounded-full">
                                                    <Search className="h-10 w-10 text-muted-foreground/40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold">{t("bulkPayment.noResults")}</h3>
                                                    <p className="text-sm text-muted-foreground">{t("bulkPayment.adjustFilters")}</p>
                                                </div>
                                                <Button variant="outline" onClick={resetFilters} className="rounded-lg">
                                                    <X className="mr-2 h-4 w-4" /> {t("bulkPayment.clearFilters")}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : batches.map((tx: any) => (
                                    <TableRow key={tx.uid} className="hover:bg-muted/20 border-b border-border last:border-0 group transition-all">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{new Date(tx.created_at).toLocaleString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{tx.uid.slice(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground">{tx.total_count} {t("bulkPayment.transactions")}</span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] font-medium text-emerald-600">{tx.succeeded_count} {t("bulkPayment.success")}</span>
                                                    <span className="text-[10px] font-medium text-rose-600">{tx.failed_count} {t("bulkPayment.failed")}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-bold text-base text-primary">{parseFloat(tx.total_amount).toLocaleString()} FCFA</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="w-24 space-y-1">
                                                <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
                                                    <span>{tx.progress_percent || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${tx.progress_percent || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <StatusBadge status={tx.status} />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-md opacity-60 group-hover:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => fetchBatchSummary(tx)} className="text-xs font-medium cursor-pointer">
                                                        <Info className="mr-2 h-4 w-4" /> {t("bulkPayment.details") || "Détails"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => fetchBatchTransactionsList(tx)} className="text-xs font-medium cursor-pointer">
                                                        <FileText className="mr-2 h-4 w-4" /> {t("bulkPayment.transactions") || "Transactions"}
                                                    </DropdownMenuItem>
                                                    {tx.can_retry && (
                                                        <DropdownMenuItem className="text-xs font-medium cursor-pointer text-blue-600">
                                                            <RotateCcw className="mr-2 h-4 w-4" /> {t("bulkPayment.reprocess") || "Reprocess"}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalCount > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
                            <p className="text-xs text-muted-foreground font-medium">
                                {t("bulkPayment.showing")} {(filters.page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(filters.page * ITEMS_PER_PAGE, totalCount)} {t("bulkPayment.of")} {totalCount} {t("bulkPayment.records")}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => handleFilterChange("page", filters.page - 1)}
                                    className="h-8 px-3 rounded-md border-border bg-background"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> {t("common.previous") || "Précédent"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page * ITEMS_PER_PAGE >= totalCount}
                                    onClick={() => handleFilterChange("page", filters.page + 1)}
                                    className="h-8 px-3 rounded-md border-border bg-background"
                                >
                                    {t("common.next") || "Suivant"} <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderCreateView = () => {
        if (!isLoadingNetworks && !permissionsLoading && !hasPermission('can_process_bulk_payment')) {
            return (
                <div className="flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl min-h-[500px]">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-8 max-w-md w-full text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Accès Refusé</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Vous n'avez pas la permission de créer des paiements de masse.
                        </p>
                        <Button
                            onClick={() => setActiveView('list')}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
                        </Button>
                    </div>
                </div>
            )
        }

        const stats = {
            count: rows.length,
            amount: rows.reduce((s, r) => s + (Number(r.amount) || 0), 0)
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const paginatedRows = rows.slice(startIndex, startIndex + ITEMS_PER_PAGE)
        const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE)

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('list')} className="rounded-md h-9 px-3 hover:bg-muted w-fit">
                            <ArrowLeft className="h-4 w-4 mr-2" /> {t("bulkPayment.backToHistory")}
                        </Button>
                        <h2 className="text-xl font-bold tracking-tight">{t("bulkPayment.draftTitle")}</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg h-9 px-4 font-medium border-border w-full sm:w-auto">
                            <Upload className="mr-2 h-4 w-4" /> {t("bulkPayment.importExcel")}
                        </Button>
                        <Button size="sm" onClick={() => addNewRow()} className="rounded-lg h-9 px-4 font-medium w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> {t("bulkPayment.addRecipient")}
                        </Button>
                        <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".xlsx,.xls,.csv" />
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[450px]">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground w-[220px]">{t("bulkPayment.phoneNumber")}</TableHead>
                                    <TableHead className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground w-[180px]">{t("bulkPayment.amount")} (FCFA)</TableHead>
                                    <TableHead className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground w-[200px]">{t("bulkPayment.network")}</TableHead>
                                    <TableHead className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.description")}</TableHead>
                                    <TableHead className="px-4 py-3 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={5} className="h-96 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                                                <FileSpreadsheet className="h-10 w-10 mb-4 stroke-[1.5]" />
                                                <p className="font-medium text-sm">{t("bulkPayment.noTransactionsAdded")}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedRows.map((row, idx) => (
                                    <TableRow key={row.id} className={cn(
                                        "border-b border-border group last:border-0",
                                        idx % 2 === 0 ? "bg-card" : "bg-muted/5"
                                    )}>
                                        <TableCell className="px-4 py-3 align-top">
                                            <div className="space-y-1.5">
                                                <Input
                                                    value={row.recipient_phone}
                                                    onChange={(e) => {
                                                        const updated = { ...row, recipient_phone: e.target.value }
                                                        updated.error = validateRow(updated)
                                                        setRows(rows.map(r => r.id === row.id ? updated : r))
                                                    }}
                                                    placeholder={t("bulkPayment.phonePlaceholder")}
                                                    className={cn(
                                                        "rounded-md h-9 border-border bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/30",
                                                        row.error?.includes(t("bulkPayment.minDigits")) && "border-destructive focus-visible:ring-destructive"
                                                    )}
                                                />
                                                {row.error?.includes(t("bulkPayment.minDigits")) && <p className="text-[10px] font-medium text-destructive ml-1">{row.error}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-top">
                                            <div className="space-y-1.5">
                                                <Input
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={(e) => {
                                                        const updated = { ...row, amount: e.target.value }
                                                        updated.error = validateRow(updated)
                                                        setRows(rows.map(r => r.id === row.id ? updated : r))
                                                    }}
                                                    className={cn(
                                                        "rounded-md h-9 border-border bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-ring transition-all font-semibold",
                                                        (row.error?.includes(t("bulkPayment.invalidAmount")) || row.error?.includes(t("bulkPayment.min")) || row.error?.includes(t("bulkPayment.max"))) && "border-destructive focus-visible:ring-destructive"
                                                    )}
                                                />
                                                {(row.error?.includes(t("bulkPayment.invalidAmount")) || row.error?.includes(t("bulkPayment.min")) || row.error?.includes(t("bulkPayment.max"))) && (
                                                    <p className="text-[10px] font-medium text-destructive ml-1">{row.error}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-top">
                                            <Select value={row.network} onValueChange={(val) => {
                                                const updated = { ...row, network: val }
                                                updated.error = validateRow(updated)
                                                setRows(rows.map(r => r.id === row.id ? updated : r))
                                            }}>
                                                <SelectTrigger className="rounded-md h-9 border-border bg-transparent shadow-none focus:ring-1">
                                                    <SelectValue placeholder={t("bulkPayment.network")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {networks.map(n => (
                                                        <SelectItem key={n.uid} value={n.uid} className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                {n.logo ? <img src={n.logo} className="w-4 h-4 rounded-sm" alt="" /> : <div className="w-4 h-4 bg-muted rounded-sm" />}
                                                                <span>{n.nom}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {row.error === t("payment.selectNetwork") && <p className="text-[10px] font-medium text-destructive ml-1 mt-1.5">{row.error}</p>}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-top">
                                            <Input
                                                value={row.objet}
                                                onChange={(e) => setRows(rows.map(r => r.id === row.id ? { ...r, objet: e.target.value } : r))}
                                                className="rounded-md h-9 border-border bg-transparent shadow-none focus-visible:ring-1"
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-top">
                                            <Button variant="ghost" size="icon" onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="h-9 w-9 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 rounded-md">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination for Create View */}
                    {rows.length > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
                            <p className="text-xs text-muted-foreground font-medium">
                                {t("bulkPayment.showing")} {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, rows.length)} {t("bulkPayment.of")} {rows.length} {t("bulkPayment.records")}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-8 px-3 rounded-md border-border bg-background"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> {t("common.previous") || "Précédent"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-8 px-3 rounded-md border-border bg-background"
                                >
                                    {t("common.next") || "Suivant"} <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-row gap-6 sm:gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("bulkPayment.transactions")}</span>
                            <span className="text-xl sm:text-2xl font-bold">{stats.count}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("bulkPayment.totalAmount")}</span>
                            <span className="text-xl sm:text-2xl font-bold text-primary">
                                {stats.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
                            </span>
                        </div>
                    </div>
                    <Button
                        disabled={isSubmitting || rows.length === 0 || rows.some(r => !!r.error)}
                        onClick={handleSubmit}
                        className="rounded-lg h-12 px-10 font-bold shadow-md shadow-primary/10 transition-transform active:scale-95 w-full md:w-auto"
                    >
                        {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : t("bulkPayment.confirmSubmit")}
                    </Button>
                </div>
            </div>
        )
    }



    const renderSummaryView = () => {
        if (!selectedBatch) return null

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('list')} className="rounded-md h-9 px-3 hover:bg-muted w-fit">
                            <ArrowLeft className="h-4 w-4 mr-2" /> {t("bulkPayment.back")}
                        </Button>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight">{t("bulkPayment.details")}</h2>
                            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground uppercase">{selectedBatch.uid.slice(0, 12)}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border shadow-none">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("bulkPayment.totalCount")}</p>
                            <p className="text-2xl font-bold">{selectedBatch.total_count}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-none border-l-4 border-l-emerald-500">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("bulkPayment.succeededCount")}</p>
                            <p className="text-2xl font-bold text-emerald-600">{selectedBatch.succeeded_count}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-none border-l-4 border-l-rose-500">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("bulkPayment.failedCount")}</p>
                            <p className="text-2xl font-bold text-rose-600">{selectedBatch.failed_count}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border shadow-none">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("bulkPayment.totalAmount")}</p>
                            <p className="text-2xl font-bold text-primary">{parseFloat(selectedBatch.total_amount).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-border shadow-none">
                        <CardContent className="p-6">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("bulkPayment.details")}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.uid")}</span>
                                    <span className="font-mono font-medium">{selectedBatch.uid}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.batchDate")}</span>
                                    <span className="font-medium">{new Date(selectedBatch.created_at).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.status")}</span>
                                    <StatusBadge status={selectedBatch.status} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-none">
                        <CardContent className="p-6">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("bulkPayment.progress")}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t("bulkPayment.progress")}</span>
                                    <span className="text-sm font-bold">{selectedBatch.progress_percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${selectedBatch.progress_percent}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t("bulkPayment.volume")}</span>
                                    <span className="text-sm font-medium">{selectedBatch.processed_count} / {selectedBatch.total_count}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-none bg-rose-50/5">
                        <CardContent className="p-6">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 font-bold text-rose-600">{t("bulkPayment.performance")}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.startedAt")}</span>
                                    <span className="font-medium">{selectedBatch.started_at ? new Date(selectedBatch.started_at).toLocaleTimeString() : "-"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.completedAt")}</span>
                                    <span className="font-medium">{selectedBatch.completed_at ? new Date(selectedBatch.completed_at).toLocaleTimeString() : "-"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{t("bulkPayment.isFinished")}</span>
                                    <span className="font-medium">{selectedBatch.is_finished ? t("common.yes") : t("common.no")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center pt-4">
                    <Button
                        onClick={() => fetchBatchTransactionsList(selectedBatch)}
                        className="rounded-xl h-12 px-8 font-bold gap-2"
                    >
                        <List className="h-5 w-5" /> {t("bulkPayment.viewTransactions")}
                    </Button>
                </div>
            </div>
        )
    }

    const renderTransactionsView = () => {
        if (!selectedBatch) return null

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('summary')} className="rounded-md h-9 px-3 hover:bg-muted w-fit">
                            <ArrowLeft className="h-4 w-4 mr-2" /> {t("bulkPayment.back")}
                        </Button>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight">{t("bulkPayment.transactions")}</h2>
                            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground uppercase">{selectedBatch.uid.slice(0, 12)}</Badge>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 font-medium w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" /> {t("bulkPayment.downloadReport")}
                    </Button>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.recipient")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.amount")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.network")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.reference")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{t("bulkPayment.description")}</TableHead>
                                    <TableHead className="px-6 py-4 h-12 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground text-center">{t("bulkPayment.status")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingBatchDetails ? (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground/30" /></TableCell></TableRow>
                                ) : batchDetails.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-muted-foreground">{t("bulkPayment.emptyLedger")}</TableCell></TableRow>
                                ) : batchDetails.map((tx: any) => (
                                    <TableRow key={tx.uid} className="hover:bg-muted/10 border-b border-border last:border-0 transition-colors">
                                        <TableCell className="px-6 py-4 font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{tx.recipient_phone}</span>
                                                {tx.recipient_name && <span className="text-[10px] text-muted-foreground">{tx.recipient_name}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 font-bold text-base text-primary">{tx.formatted_amount || `${parseFloat(tx.amount).toLocaleString()} FCFA`}</TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {tx.network?.image || tx.network?.logo ? (
                                                    <img
                                                        src={tx.network.image || tx.network.logo}
                                                        className="w-5 h-5 rounded-sm grayscale-[0.5]"
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className="w-5 h-5 bg-muted rounded-sm" />
                                                )}
                                                <span className="text-sm font-medium">{tx.network?.nom || tx.network_name || tx.network?.code || t("common.unknown")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-muted rounded border font-medium text-muted-foreground block truncate max-w-[150px]">
                                                {tx.reference}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-xs italic text-muted-foreground truncate max-w-[150px]">
                                            {tx.objet || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <StatusBadge status={tx.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {t("bulkPayment.showing")} 1-{batchDetails.length} {t("bulkPayment.of")} {selectedBatch.total_count} {t("bulkPayment.records")}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-0">
            {activeView === 'list' && renderListView()}
            {activeView === 'create' && renderCreateView()}
            {activeView === 'summary' && renderSummaryView()}
            {activeView === 'transactions' && renderTransactionsView()}
            {/* Backward compatibility for any direct 'details' sets */}
            {activeView === 'details' && renderSummaryView()}

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-border">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t("bulkPayment.confirmTitle")}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground pt-2">
                            {t("bulkPayment.confirmDescription", {
                                count: rows.length,
                                amount: rows.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString()
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-primary/5 rounded-full ring-8 ring-primary/5">
                            <Send className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{rows.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">{rows.length} {t("bulkPayment.transactions")}</p>
                        </div>

                        <div className="w-full max-h-[220px] overflow-y-auto border border-border rounded-xl p-4 space-y-3 bg-muted/5">
                            {rows.map((row, i) => (
                                <div key={i} className="flex justify-between items-center text-xs pb-3 border-b border-border/50 last:border-0 last:pb-0">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{row.recipient_phone}</span>
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-background font-medium">
                                                {networks.find(n => n.uid === row.network)?.nom || row.network || t("common.unknown")}
                                            </Badge>
                                        </div>
                                        {row.objet && <span className="text-[10px] text-muted-foreground line-clamp-1 italic">"{row.objet}"</span>}
                                    </div>
                                    <span className="font-bold text-primary">{Number(row.amount).toLocaleString()} FCFA</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className="flex sm:justify-between gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 rounded-xl h-11 font-semibold"
                        >
                            {t("bulkPayment.cancel")}
                        </Button>
                        <Button
                            onClick={confirmSend}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            {t("bulkPayment.send")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
