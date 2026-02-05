'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p>
                We collect information necessary to provide our matrimony services:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Account information (email, phone number)</li>
                <li>Profile information (name, age, bio, preferences)</li>
                <li>Optional photos (if you choose to upload them)</li>
                <li>ID documents for verification (securely stored and restricted access)</li>
                <li>Messages and communications between users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Verify your identity and maintain platform security</li>
                <li>Match you with potential matrimonial partners</li>
                <li>Facilitate secure messaging between users</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Data encryption at rest and in transit</li>
                <li>Secure storage of sensitive documents</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits</li>
                <li>HTTPS-only communication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Privacy Controls</h2>
              <p>
                You have control over your privacy settings:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Control photo visibility (private, public, verified-only)</li>
                <li>Control profile visibility</li>
                <li>Block or report users</li>
                <li>Delete your account and data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Sharing Information</h2>
              <p>
                We do NOT sell your personal information. We only share:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Profile information with other verified users (based on your privacy settings)</li>
                <li>Information required by law or legal process</li>
                <li>Aggregated, anonymized data for analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of certain data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have questions about this privacy policy or your data, please contact us 
                through the platform&apos;s support system.
              </p>
            </section>

            <div className="mt-8 flex space-x-4">
              <Link
                href="/"
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}