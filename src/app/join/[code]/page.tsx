'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const code = params.code as string
    if (code) {
      sessionStorage.setItem('wiispr_referral_code', code.toUpperCase())
    }
    router.replace('/auth')
  }, [])

  return null
}
