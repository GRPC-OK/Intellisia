// src/pages/_app.tsx - 헤더 중복 제거 버전
import '@/styles/globals.css';
import '../styles/docker-analysis.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { GithubProvider } from '../context/GithubContext';
import Footer from '../components/Footer';
// import Header from '../components/Header'; 

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <GithubProvider>
        {/* <Header /> 제거 - 각 페이지에서 필요에 따라 개별 구현 */}
        <Component {...pageProps} />
        <Footer />
      </GithubProvider>
    </SessionProvider>
  );
}