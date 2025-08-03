"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Eye, EyeOff } from "lucide-react"
import { getCard } from "@/lib/firebase-payment"

export default function PaymentHistory() {
  const [docId, setDocId] = useState("")
  const [cardData, setCardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showFullCard, setShowFullCard] = useState(false)

  const handleRetrieve = async () => {
    if (!docId.trim()) {
      setError("Please enter a document ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await getCard(docId)
      if (data) {
        setCardData(data)
      } else {
        setError("No payment found with this ID")
      }
    } catch (err) {
      setError("Failed to retrieve payment data")
      console.error("Retrieval error:", err)
    } finally {
      setLoading(false)
    }
  }

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return ""
    const last4 = cardNumber.slice(-4)
    return `**** **** **** ${last4}`
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Retrieve Payment
          </CardTitle>
          <CardDescription>Enter a document ID to retrieve encrypted payment data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docId">Document ID</Label>
            <Input
              id="docId"
              placeholder="Enter document ID"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
            />
          </div>

          <Button onClick={handleRetrieve} disabled={loading} className="w-full">
            {loading ? "Retrieving..." : "Retrieve Payment"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cardData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Cardholder Name</Label>
                  <p className="text-sm text-gray-600">{cardData.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Card Number</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 font-mono">
                      {showFullCard ? cardData.cardNumber : maskCardNumber(cardData.cardNumber)}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setShowFullCard(!showFullCard)}>
                      {showFullCard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expiry</Label>
                  <p className="text-sm text-gray-600">{cardData.expiry}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm text-gray-600">{cardData.createdAt?.toDate?.()?.toLocaleString() || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
