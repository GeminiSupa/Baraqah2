import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { ContactForm } from '@/components/ContactForm'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatedBackground intensity="full" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 safe-top safe-bottom bg-gradient-to-br from-primary-700/90 via-primary-600/90 to-purple-700/85 text-white">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy & CTAs */}
          <div className="text-center lg:text-left">
            {/* Logo */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/90 rounded-ios-xl shadow-ios-xl flex items-center justify-center backdrop-blur-ios overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Baraqah logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Main Headline (inspired by Pure Matrimony) */}
            <p className="text-ios-caption1 tracking-[0.2em] uppercase text-white/80 mb-2">
              Muslim Matrimony • Halal & Private
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]">
              Believe in Your <span className="text-iosGreen-light drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]">Happily Ever After</span>
            </h1>
            <p className="text-base sm:text-lg text-white/90 mb-2 max-w-xl lg:max-w-none">
              Baraqah is a dedicated matrimony platform for practising Muslims.
            </p>
            <p className="text-sm sm:text-base text-white/85 mb-6 max-w-xl lg:max-w-none">
              Find someone who shares your deen, values and vision for marriage — in a way that
              protects your privacy and keeps things halal.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-ios-lg rounded-ios-lg px-4 py-3 border border-white/20 min-w-[120px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
                <div className="text-xs sm:text-sm text-white/80">Practising Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-ios-lg rounded-ios-lg px-4 py-3 border border-white/20 min-w-[120px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">100 / week</div>
                <div className="text-xs sm:text-sm text-white/80">Average Matches</div>
              </div>
              <div className="bg-white/10 backdrop-blur-ios-lg rounded-ios-lg px-4 py-3 border border-white/20 min-w-[120px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-white/80">Halal Experience</div>
              </div>
            </div>

            {/* CTA Buttons */}
            {session ? (
              session.user.isAdmin ? (
                <div className="space-y-3">
                  <p className="text-white/90 text-sm sm:text-base">
                    Welcome back, Admin. Manage reports, profiles and verifications.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex justify-center items-center bg-white text-iosBlue px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/90 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                  >
                    Go to Admin Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/90 text-sm sm:text-base">
                    Welcome back! Continue your journey towards a blessed marriage.
                  </p>
                  {!session.user.idVerified ? (
                    <Link
                      href="/id-verification"
                      className="inline-flex justify-center items-center bg-white text-iosBlue px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/90 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                    >
                      Complete ID Verification
                    </Link>
                  ) : !session.user.profileActive ? (
                    <Link
                      href="/profile/create"
                      className="inline-flex justify-center items-center bg-white text-iosBlue px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/90 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                    >
                      Create Your Matrimonial Profile
                    </Link>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link
                        href="/browse"
                        className="inline-flex justify-center items-center bg-white text-iosBlue px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/90 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                      >
                        Browse Matches
                      </Link>
                      <Link
                        href="/profile"
                        className="inline-flex justify-center items-center bg-white/10 backdrop-blur-ios-lg text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/15 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                      >
                        View Your Profile
                      </Link>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-white/80">
                  No credit card required. Your contact details stay private.
                </p>
                {/* Quick Signup Strip (mobile-first) */}
                <div className="bg-white/95 rounded-ios-xl shadow-ios-lg px-4 py-4 sm:px-5 sm:py-5 text-left space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Create your free matrimonial account
                  </p>
                  <form action="/register" method="get" className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="sr-only" htmlFor="hero-first-name">
                        First name
                      </label>
                      <input
                        id="hero-first-name"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        className="flex-1 rounded-ios-lg border border-iosGray-4 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-iosBlue"
                        autoComplete="given-name"
                      />
                      <label className="sr-only" htmlFor="hero-email">
                        Email
                      </label>
                      <input
                        id="hero-email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="flex-1 rounded-ios-lg border border-iosGray-4 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-iosBlue"
                        autoComplete="email"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <div className="flex-1 sm:flex-none">
                        <label className="sr-only" htmlFor="hero-seeking">
                          I am seeking a…
                        </label>
                        <select
                          id="hero-seeking"
                          name="seeking"
                          className="w-full sm:w-40 rounded-ios-lg border border-iosGray-4 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-iosBlue bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            I am seeking a…
                          </option>
                          <option value="wife">Wife</option>
                          <option value="husband">Husband</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex justify-center items-center flex-1 bg-iosBlue text-white px-4 py-2.5 rounded-ios-lg hover:bg-iosBlue-dark text-xs sm:text-sm font-semibold ios-press shadow-ios"
                      >
                        Continue Registration
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs text-iosGray-1">
                      By continuing, you&apos;ll complete your details on the registration page.
                    </p>
                  </form>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex justify-center items-center bg-white/10 backdrop-blur-ios-lg text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-3.5 rounded-ios-lg hover:bg-white/15 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
                  >
                    Already a Member? Log In
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: Mini “how it works” / reassurance */}
          <div className="bg-white/95 backdrop-blur-ios-lg rounded-ios-2xl shadow-ios-xl p-5 sm:p-6 lg:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              A Matrimony Experience Built on Deen
            </h2>
            <p className="text-sm sm:text-base text-iosGray-1">
              Baraqah follows a simple, halal-first journey that mirrors what you see on
              professional matrimony sites like{' '}
              <span className="font-semibold">Pure Matrimony</span>:
            </p>
            <ol className="space-y-3 text-left text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iosBlue text-white text-xs font-semibold mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Create a sincere profile</p>
                  <p className="text-xs sm:text-sm text-iosGray-1">
                    Share who you are, your level of practice and what you&apos;re seeking.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iosGreen text-white text-xs font-semibold mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Clarify your expectations</p>
                  <p className="text-xs sm:text-sm text-iosGray-1">
                    Answer thoughtful questions about values, family and your vision for marriage.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iosOrange text-white text-xs font-semibold mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Connect with compatible matches</p>
                  <p className="text-xs sm:text-sm text-iosGray-1">
                    Use questionnaires, messaging and ID-verified profiles to move forward with
                    confidence.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Purity / Privacy / Security Section */}
      <section className="relative z-10 bg-white/95 backdrop-blur-ios-lg py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Purity. Privacy. Security.
          </h2>
          <p className="text-sm sm:text-base text-iosGray-1 text-center max-w-2xl mx-auto mb-10">
            Inspired by the ayah{' '}
            <span className="font-semibold">
              “Women of purity are for men of purity, and men of purity are for women of purity”
            </span>{' '}
            (Qur&apos;an 24:26), Baraqah is designed to keep your search dignified and protected.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-iosBg-secondary rounded-ios-xl p-5 sm:p-6 shadow-ios-lg text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-iosBlue/5 rounded-ios-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-iosBlue/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">Purity</h3>
              <p className="text-xs sm:text-sm text-iosGray-1">
                No public flirting, no public contact details. Built for practising Muslims who
                want a halal, serious path to marriage.
              </p>
            </div>

            <div className="bg-iosBg-secondary rounded-ios-xl p-5 sm:p-6 shadow-ios-lg text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-iosGreen/5 rounded-ios-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-iosGreen/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm-9 8a6 6 0 0112 0H3zm9 0a6 6 0 0112 0h-12z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">Privacy</h3>
              <p className="text-xs sm:text-sm text-iosGray-1">
                Control who sees your photos and profile details. Your contact information stays
                hidden until you choose to share it.
              </p>
            </div>

            <div className="bg-iosBg-secondary rounded-ios-xl p-5 sm:p-6 shadow-ios-lg text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-iosOrange/5 rounded-ios-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-iosOrange/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">Security</h3>
              <p className="text-xs sm:text-sm text-iosGray-1">
                ID verification, report system and admin tools help keep scammers and bad behaviour
                away from the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 bg-gradient-to-b from-white/95 to-iosBg-secondary py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            How Baraqah Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                desc: 'Share your background, level of practice and what you are seeking in a spouse.',
              },
              {
                step: '2',
                title: 'Complete Your Questionnaire',
                desc: 'Answer guided questions about values, roles, family and your vision for marriage.',
              },
              {
                step: '3',
                title: 'Connect & Communicate',
                desc: 'Send requests, review answers and chat in a WhatsApp-style, halal-first messenger.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center bg-iosBg-secondary rounded-ios-xl p-6 sm:p-7 shadow-ios-lg">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-iosBlue rounded-ios-full flex items-center justify-center mx-auto mb-4 shadow-ios-lg">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-iosGray-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="relative z-10 bg-white/95 backdrop-blur-ios-lg py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            Real Stories from Baraqah Couples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote:
                  'We both wanted someone practising and serious about nikah. Baraqah made it easy to filter and connect in a dignified way.',
                author: 'Ahmad & Fatima',
                location: 'London, UK',
              },
              {
                quote:
                  'ID verification and the questionnaires gave us confidence we were speaking to real, compatible people — not time wasters.',
                author: 'Omar & Aisha',
                location: 'Toronto, Canada',
              },
              {
                quote:
                  'Within a few weeks we found each other and involved our families. The entire journey felt respectful and aligned with our deen.',
                author: 'Yusuf & Zainab',
                location: 'Sydney, Australia',
              },
            ].map((story, index) => (
              <div key={index} className="bg-iosBg-secondary rounded-ios-xl p-6 sm:p-7 shadow-ios-lg flex flex-col">
                <p className="text-xs sm:text-sm text-iosGray-1 mb-4 italic">
                  &quot;{story.quote}&quot;
                </p>
                <div className="mt-auto border-t border-iosGray-5 pt-3">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{story.author}</p>
                  <p className="text-xs sm:text-sm text-iosGray-1">{story.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="relative z-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Contact Us
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Have questions or need support? Reach out to us via email or WhatsApp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Email Contact */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 text-center">
              <div className="w-12 h-12 bg-iosBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-iosBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <a href="mailto:info@ux4u.online" className="text-iosBlue hover:text-iosBlue-dark font-medium">
                info@ux4u.online
              </a>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Us</h3>
              <a 
                href="https://wa.me/923255116929" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                +92 325 511 6929
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </section>

      {/* Final CTA */}
      {!session && (
        <section className="relative z-10 bg-gradient-to-r from-iosBlue to-iosGreen py-16 sm:py-18 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Nikah Journey?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Join Baraqah today and search practising single Muslims in a secure, halal and
              family-friendly environment.
            </p>
            <p className="text-xs sm:text-sm text-white/80 mb-5">
              Free to register. No credit card required. Your details remain private.
            </p>
            <Link
              href="/register"
              className="inline-flex justify-center items-center bg-white text-iosBlue px-8 sm:px-10 py-3.5 sm:py-4 rounded-ios-lg hover:bg-white/90 text-sm sm:text-base font-semibold shadow-ios-xl ios-press transition-all"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
