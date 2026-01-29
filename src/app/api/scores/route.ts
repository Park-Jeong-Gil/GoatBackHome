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
    const { nickname, player_id, clear_time, max_height } = body

    // 유효성 검사
    if (!nickname || clear_time === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let data

    if (player_id) {
      // player_id가 있으면 기존 기록 확인
      const { data: existing } = await supabase
        .from('scores')
        .select('*')
        .eq('player_id', player_id)
        .single()

      if (existing) {
        if (clear_time < existing.clear_time) {
          // 새 기록이 더 빠르면 UPDATE
          const { data: updated, error } = await supabase
            .from('scores')
            .update({
              nickname: nickname.slice(0, 12),
              clear_time,
              max_height,
            })
            .eq('player_id', player_id)
            .select()
            .single()

          if (error) throw error
          data = updated
        } else {
          // 기존 기록이 더 빠르면 저장하지 않음
          const { count } = await supabase
            .from('scores')
            .select('*', { count: 'exact', head: true })
            .lt('clear_time', existing.clear_time)

          return NextResponse.json({
            success: true,
            rank: (count || 0) + 1,
            data: existing,
            isNewRecord: false,
          })
        }
      } else {
        // 기존 기록 없음 → INSERT
        const { data: inserted, error } = await supabase
          .from('scores')
          .insert({
            nickname: nickname.slice(0, 12),
            player_id,
            clear_time,
            max_height,
          })
          .select()
          .single()

        if (error) throw error
        data = inserted
      }
    } else {
      // player_id 없음 (이전 버전 호환) → 기존 방식으로 INSERT
      const { data: inserted, error } = await supabase
        .from('scores')
        .insert({
          nickname: nickname.slice(0, 12),
          clear_time,
          max_height,
        })
        .select()
        .single()

      if (error) throw error
      data = inserted
    }

    // 순위 계산
    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .lt('clear_time', clear_time)

    return NextResponse.json({
      success: true,
      rank: (count || 0) + 1,
      data,
      isNewRecord: true,
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
  const playerId = searchParams.get('player_id')

  try {
    // 상위 N명 조회
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .order('clear_time', { ascending: true })
      .limit(limit)

    if (error) throw error

    // 특정 플레이어 순위 조회
    let userRank = null
    if (playerId) {
      const { data: userScore } = await supabase
        .from('scores')
        .select('*')
        .eq('player_id', playerId)
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
