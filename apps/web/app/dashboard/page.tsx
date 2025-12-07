'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    workflows: 0,
    executions: 0,
    aiShorts: 0,
    storage: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // 애니메이션 효과로 숫자 증가
    const timer = setInterval(() => {
      setStats(prev => ({
        workflows: Math.min(prev.workflows + 1, 12),
        executions: Math.min(prev.executions + 50, 1547),
        aiShorts: Math.min(prev.aiShorts + 1, 38),
        storage: Math.min(prev.storage + 0.5, 15.8),
      }));
    }, 30);

    setTimeout(() => clearInterval(timer), 1000);
    return () => clearInterval(timer);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
                NG
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NeuralGrid
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-purple-400 font-semibold">
                대시보드
              </Link>
              <Link href="http://n8n.neuralgrid.kr" className="hover:text-purple-400 transition-colors">
                워크플로우
              </Link>
              <Link href="/mypage" className="hover:text-purple-400 transition-colors">
                마이페이지
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="hover:text-purple-400 transition-colors">
                  관리자
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">
                {session.user?.role || 'USER'}
              </div>
              <Link href="/mypage" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              대시보드
            </h1>
            <p className="text-xl text-gray-400">
              환영합니다, {session.user?.name || session.user?.email}님! 📊
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Workflows */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🔄</div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                  +3 이번 주
                </div>
              </div>
              <div className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stats.workflows}
              </div>
              <div className="text-gray-400 font-semibold">활성 워크플로우</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  총 실행 가능: <span className="text-purple-400 font-semibold">무제한</span>
                </div>
              </div>
            </div>

            {/* Executions */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">⚡</div>
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400">
                  98.5% 성공
                </div>
              </div>
              <div className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.executions.toLocaleString()}
              </div>
              <div className="text-gray-400 font-semibold">이번 달 실행</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  월 한도: <span className="text-blue-400 font-semibold">10,000회</span>
                </div>
              </div>
            </div>

            {/* AI Shorts */}
            <div className="bg-gradient-to-br from-pink-900/30 to-pink-600/10 border border-pink-500/30 rounded-3xl p-8 hover:border-pink-500/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🎬</div>
                <div className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-xs text-pink-400">
                  12개 대기중
                </div>
              </div>
              <div className="text-5xl font-black mb-2 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                {stats.aiShorts}
              </div>
              <div className="text-gray-400 font-semibold">AI 쇼츠 생성</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  월 한도: <span className="text-pink-400 font-semibold">50개</span>
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/30 rounded-3xl p-8 hover:border-green-500/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💾</div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                  21% 사용
                </div>
              </div>
              <div className="text-5xl font-black mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stats.storage.toFixed(1)}GB
              </div>
              <div className="text-gray-400 font-semibold">스토리지 사용량</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  총 용량: <span className="text-green-400 font-semibold">100GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Recent Workflows */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">최근 워크플로우</h2>
                <a href="http://n8n.neuralgrid.kr" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  전체 보기 →
                </a>
              </div>

              <div className="space-y-4">
                {[
                  { name: '이메일 자동 분류', status: 'running', executions: 234, success: 98 },
                  { name: 'Slack 알림 자동화', status: 'running', executions: 156, success: 100 },
                  { name: 'Google Sheets 동기화', status: 'stopped', executions: 89, success: 94 },
                  { name: 'GitHub 이슈 추적', status: 'running', executions: 45, success: 97 },
                ].map((workflow, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl hover:bg-black/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        workflow.status === 'running'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-gray-500/20 border border-gray-500/30'
                      }`}>
                        {workflow.status === 'running' ? '▶️' : '⏸️'}
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-purple-400 transition-colors">
                          {workflow.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workflow.executions}회 실행 · 성공률 {workflow.success}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflow.status === 'running' && (
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                          실행 중
                        </div>
                      )}
                      <button className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all">
                        <span className="text-gray-400">⋯</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">빠른 작업</h2>

              <div className="space-y-3">
                <a href="http://n8n.neuralgrid.kr" className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                    🔄
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold group-hover:text-purple-300 transition-colors">
                      워크플로우 만들기
                    </div>
                    <div className="text-xs text-gray-500">n8n 에디터 열기</div>
                  </div>
                  <span className="text-gray-500 group-hover:text-purple-400 transition-colors">→</span>
                </a>

                <Link href="/mypage" className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl hover:border-green-500/50 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold group-hover:text-green-300 transition-colors">
                      마이페이지
                    </div>
                    <div className="text-xs text-gray-500">프로필 및 사용량</div>
                  </div>
                  <span className="text-gray-500 group-hover:text-green-400 transition-colors">→</span>
                </Link>

                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl hover:border-red-500/50 transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-2xl">
                      🛡️
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold group-hover:text-red-300 transition-colors">
                        관리자 대시보드
                      </div>
                      <div className="text-xs text-gray-500">시스템 관리</div>
                    </div>
                    <span className="text-gray-500 group-hover:text-red-400 transition-colors">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6">시스템 상태</h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'n8n 서버', status: 'online', uptime: '99.9%', color: 'green' },
                { name: 'Web 서버', status: 'online', uptime: '99.7%', color: 'green' },
                { name: 'API 게이트웨이', status: 'online', uptime: '100%', color: 'green' },
                { name: '데이터베이스', status: 'online', uptime: '99.8%', color: 'green' },
              ].map((service, i) => (
                <div key={i} className="p-6 bg-black/30 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{service.name}</div>
                    <div className={`w-3 h-3 rounded-full ${service.status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">가동률</div>
                  <div className="text-2xl font-bold text-green-400">{service.uptime}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
