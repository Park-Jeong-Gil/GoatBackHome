import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// 점수 저장
export async function POST(request: NextRequest) {
  // Supabase가 설정되지 않은 경우
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json(
      { success: true, rank: 1, message: 'Supabase not configured (dev mode)' },
      { status: 200 }
    )
  }

  try {
    const body = await request.json()
    const { nickname, clear_time, max_height } = body

    // 유효성 검사
    if (!nickname || clear_time === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 저장
    const { data, error } = await supabase
      .from('scores')
      .insert({
        nickname: nickname.slice(0, 12),
        clear_time,
        max_height,
      })
      .select()
      .single()

    if (error) throw error

    // 순위 계산
    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .lt('clear_time', clear_time)

    return NextResponse.json({
      success: true,
      rank: (count || 0) + 1,
      data,
    })
  } catch (error) {
    console.error('Score save error:', error)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}

// 랭킹 조회
export async function GET(request: NextRequest) {
  // Supabase가 설정되지 않은 경우 목 데이터 반환
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({
      scores: [
        { id: '1', nickname: 'TestPlayer1', clear_time: 300, max_height: 5000, created_at: new Date().toISOString() },
        { id: '2', nickname: 'TestPlayer2', clear_time: 450, max_height: 5000, created_at: new Date().toISOString() },
        { id: '3', nickname: 'TestPlayer3', clear_time: 600, max_height: 5000, created_at: new Date().toISOString() },
      ],
      total: 3,
      userRank: null,
    })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '100')
  const nickname = searchParams.get('nickname')

  try {
    // 상위 N명 조회
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .order('clear_time', { ascending: true })
      .limit(limit)

    if (error) throw error

    // 특정 닉네임 순위 조회
    let userRank = null
    if (nickname) {
      const { data: userScore } = await supabase
        .from('scores')
        .select('*')
        .eq('nickname', nickname)
        .order('clear_time', { ascending: true })
        .limit(1)
        .single()

      if (userScore) {
        const { count } = await supabase
          .from('scores')
          .select('*', { count: 'exact', head: true })
          .lt('clear_time', userScore.clear_time)

        userRank = {
          rank: (count || 0) + 1,
          score: userScore,
        }
      }
    }

    return NextResponse.json({
      scores,
      total: scores?.length || 0,
      userRank,
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
