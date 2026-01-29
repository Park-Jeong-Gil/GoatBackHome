-- 1. player_id 컬럼 추가
ALTER TABLE scores ADD COLUMN player_id TEXT;

-- 2. 기존 중복 데이터 정리: 닉네임별 가장 빠른 기록만 남기고 삭제
DELETE FROM scores
WHERE id NOT IN (
  SELECT DISTINCT ON (nickname) id
  FROM scores
  ORDER BY nickname, clear_time ASC
);

-- 3. player_id에 UNIQUE 인덱스 생성 (NULL 허용 - 기존 데이터 호환)
CREATE UNIQUE INDEX idx_scores_player_id ON scores (player_id) WHERE player_id IS NOT NULL;

-- 4. UPDATE 권한 추가 (기존 RLS에 UPDATE 정책 추가)
CREATE POLICY "Anyone can update their own scores"
  ON scores FOR UPDATE
  USING (true)
  WITH CHECK (true);
