'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import PesaPalPayment from '../components/PesaPalPayment'

interface PaymentData {
  trackId: string
  trackTitle: string
  price: number
  audioUrl?: string
}

interface PaymentContextType {
  showPayment: (data: PaymentData) => void
  hidePayment: () => void
  isPaymentVisible: boolean
  paymentData: PaymentData | null
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isPaymentVisible, setIsPaymentVisible] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)

  const showPayment = (data: PaymentData) => {
    setPaymentData(data)
    setIsPaymentVisible(true)
  }

  const hidePayment = () => {
    setIsPaymentVisible(false)
    setPaymentData(null)
  }

  const handleSuccess = (downloadLink: string) => {
    hidePayment()
    // Trigger global success event
    window.dispatchEvent(new CustomEvent('paymentSuccess', {
      detail: { downloadLink, trackId: paymentData?.trackId }
    }))
  }

  return (
    <PaymentContext.Provider value={{
      showPayment,
      hidePayment,
      isPaymentVisible,
      paymentData
    }}>
      {children}
      {isPaymentVisible && paymentData && (
        <PesaPalPayment
          trackId={paymentData.trackId}
          trackTitle={paymentData.trackTitle}
          price={paymentData.price}
          onClose={hidePayment}
          onSuccess={handleSuccess}
        />
      )}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    // Return a default context during server-side rendering or when not in Provider
    if (typeof window === 'undefined') {
      // Server-side rendering - return minimal context
      return {
        showPayment: () => {},
        hidePayment: () => {},
        isPaymentVisible: false,
        paymentData: null
      };
    }
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}