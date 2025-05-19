import '@/styles/globals.css';
import '../styles/docker-analysis.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react'
import { GithubProvider } from '../context/GithubContext'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <GithubProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </GithubProvider>
    </SessionProvider>
  )
}
