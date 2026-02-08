'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/components/LanguageProvider'

export function ContactForm() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || t('home.thankYouContact'))
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        setError(data.error || t('home.failedToSend'))
      }
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-3xl shadow-xl border border-gray-100/50">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('home.sendUsMessage')}</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('home.name')} *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue text-gray-900 bg-white"
            placeholder={t('home.yourName')}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.email')} *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue text-gray-900 bg-white"
            placeholder={t('auth.email')}
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
            {t('home.subject')} *
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue text-gray-900 bg-white"
            placeholder={t('home.whatIsThisRegarding')}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
            {t('home.message')} *
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue resize-y text-gray-900 bg-white"
            placeholder={t('home.tellUsHowWeCanHelp')}
            minLength={10}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="font-semibold"
        >
          {loading ? t('home.sending') : t('home.sendMessage')}
        </Button>
      </form>
    </Card>
  )
}
