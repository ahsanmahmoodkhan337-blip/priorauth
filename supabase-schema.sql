-- ============================================================================
-- MedHero PriorAuth AI — Supabase Database Schema
-- Run this migration in the Supabase SQL Editor to create all tables.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TABLE 1: access_requests (replaces serverStore.json)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  email             TEXT DEFAULT '',
  payment_method    TEXT NOT NULL DEFAULT 'easypaisa'
                    CHECK (payment_method IN ('bank-islami', 'easypaisa', 'paypal')),
  transaction_id    TEXT NOT NULL,
  receipt_sent      BOOLEAN DEFAULT FALSE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  access_duration_days INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for phone lookups (login)
CREATE INDEX IF NOT EXISTS idx_access_requests_phone ON access_requests(phone);
-- Index for admin listing (sorted by submitted_at)
CREATE INDEX IF NOT EXISTS idx_access_requests_submitted ON access_requests(submitted_at DESC);

-- RLS: Enable
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Public can INSERT (enrollment form)
CREATE POLICY "Public can insert access requests"
  ON access_requests FOR INSERT
  WITH CHECK (true);

-- RLS: Authenticated users can read their own row by phone
CREATE POLICY "Users can read own request"
  ON access_requests FOR SELECT
  USING (phone = current_setting('request.jwt.claims', true)::json->>'phone'
         OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- RLS: Admin can read all rows (admin-level key or service_role)
CREATE POLICY "Admin can read all requests"
  ON access_requests FOR SELECT
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- RLS: Admin can update (approve/reject)
CREATE POLICY "Admin can update requests"
  ON access_requests FOR UPDATE
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- ---------------------------------------------------------------------------
-- TABLE 2: pa_cases — prior authorization cases
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pa_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_name        TEXT NOT NULL,
  cpt_code          TEXT NOT NULL,
  procedure_name    TEXT,
  lcd_number        TEXT,
  chart_note        TEXT,
  status            TEXT DEFAULT 'draft'
                    CHECK (status IN ('draft', 'submitted', 'approved', 'denied', 'appealed')),
  approval_score    INTEGER,
  risk_level        TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  submitted_by_phone TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pa_cases_phone ON pa_cases(submitted_by_phone);
CREATE INDEX IF NOT EXISTS idx_pa_cases_created ON pa_cases(created_at DESC);

ALTER TABLE pa_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own cases"
  ON pa_cases FOR ALL
  USING (submitted_by_phone = current_setting('request.jwt.claims', true)::json->>'phone')
  WITH CHECK (submitted_by_phone = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Admin can read all cases"
  ON pa_cases FOR SELECT
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- ---------------------------------------------------------------------------
-- TABLE 3: audit_results — audit/evaluation results
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID REFERENCES pa_cases(id) ON DELETE CASCADE,
  payer_name        TEXT NOT NULL,
  cpt_code          TEXT NOT NULL,
  procedure_name    TEXT,
  approval_score    INTEGER NOT NULL,
  risk_level        TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  satisfied_criteria JSONB DEFAULT '[]',
  missing_criteria   JSONB DEFAULT '[]',
  justification_letter TEXT,
  chart_note_snapshot TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_results(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_results(created_at DESC);

ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;

-- Allow reads/writes via the app's anon key (RLS bypassed via service_role in API)
CREATE POLICY "App can manage audit results"
  ON audit_results FOR ALL
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- TABLE 4: payer_policies — LCD/NCD policy data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payer_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_name        TEXT NOT NULL,
  cpt_code          TEXT NOT NULL,
  procedure_name    TEXT NOT NULL,
  lcd_number        TEXT,
  criteria          JSONB NOT NULL DEFAULT '[]',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payer_name, cpt_code)
);

CREATE INDEX IF NOT EXISTS idx_policies_payer_cpt ON payer_policies(payer_name, cpt_code);

ALTER TABLE payer_policies ENABLE ROW LEVEL SECURITY;

-- Anyone can read active policies
CREATE POLICY "Anyone can read active policies"
  ON payer_policies FOR SELECT
  USING (is_active = true);

-- Admin can manage policies
CREATE POLICY "Admin can manage policies"
  ON payer_policies FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- ---------------------------------------------------------------------------
-- TABLE 5: guideline_sync_log — sync history from /api/sync-guidelines
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guideline_sync_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policies_updated  INTEGER DEFAULT 0,
  sources           JSONB DEFAULT '[]',
  sync_status       TEXT DEFAULT 'completed' CHECK (sync_status IN ('started', 'completed', 'failed')),
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE guideline_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App can manage sync log"
  ON guideline_sync_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SEED DATA: Pre-populate payer_policies with the 3 built-in policies
-- ============================================================================
INSERT INTO payer_policies (payer_name, cpt_code, procedure_name, lcd_number, criteria)
VALUES
  (
    'Aetna',
    '72148',
    'MRI Lumbar Spine without Contrast',
    'L36789',
    '[
      {"id":"aetna-lumbar-01","description":"6 weeks of conservative treatment documented (PT, NSAIDs, or chiropractic)","mandatory":true,"keywords":["physical therapy","PT","conservative","nsaids","chiropractic","ibuprofen","naproxen","conservative care","conservative treatment","physiotherapy","rehabilitation","exercise program","home exercise"]},
      {"id":"aetna-lumbar-02","description":"Neurological deficit documented (radiculopathy, weakness, numbness, reflex changes)","mandatory":true,"keywords":["radiculopathy","sciatica","weakness","numbness","reflex","sensory deficit","motor deficit","straight leg raise","SLR","diminished","absent reflex","paresthesia","tingling","hypoesthesia","foot drop"]},
      {"id":"aetna-lumbar-03","description":"Pain unresponsive to conservative measures","mandatory":true,"keywords":["failed","persistent pain","no relief","worsening","refractory","unresponsive","intractable","no improvement","inadequate response","continued pain","ongoing pain"]},
      {"id":"aetna-lumbar-04","description":"No prior MRI within 6 months","mandatory":true,"keywords":[]},
      {"id":"aetna-lumbar-05","description":"Red flags excluded (cauda equina, infection, tumor, fracture)","mandatory":false,"keywords":["red flags","cauda equina","infection","tumor","fracture","malignancy","trauma","fever","weight loss","night sweats","bowel","bladder"]}
    ]'
  ),
  (
    'Blue Cross Blue Shield',
    '27447',
    'Total Knee Arthroplasty',
    'L35123',
    '[
      {"id":"bcbs-knee-01","description":"Radiographic evidence of advanced osteoarthritis (K-L grade 3 or 4)","mandatory":true,"keywords":["Kellgren-Lawrence","K-L grade","K-L 3","K-L 4","K-L III","K-L IV","joint space narrowing","osteophyte","subchondral sclerosis","bone-on-bone","severe osteoarthritis","advanced OA","tricompartmental","end-stage"]},
      {"id":"bcbs-knee-02","description":"Failure of at least 3 months of non-surgical management","mandatory":true,"keywords":["physical therapy","PT","nsaids","conservative management","failed conservative","corticosteroid injection","viscosupplementation","hyaluronic acid","failed PT","activity modification","weight loss","bracing","assistive device","cane","walker"]},
      {"id":"bcbs-knee-03","description":"Significant functional limitation affecting activities of daily living","mandatory":true,"keywords":["functional limitation","ADL","activities of daily living","ambulation","stair climbing","standing","walking","range of motion","varus","valgus","deformity","contracture","stiffness","instability","walk","mobility"]},
      {"id":"bcbs-knee-04","description":"Weight-bearing X-ray within 3 months of request","mandatory":true,"keywords":[]},
      {"id":"bcbs-knee-05","description":"Pre-operative medical clearance completed","mandatory":false,"keywords":["medical clearance","pre-operative clearance","cardiac clearance","surgical clearance","PCP evaluation","medically cleared","anesthesia clearance"]}
    ]'
  ),
  (
    'Medicare MAC (Novitas)',
    '93306',
    'Transthoracic Echocardiogram, Complete',
    'L34567',
    '[
      {"id":"medicare-echo-01","description":"Signs or symptoms of new or worsening cardiac disease","mandatory":true,"keywords":["shortness of breath","dyspnea","orthopnea","edema","chest pain","palpitations","syncope","murmur","JVD","jugular venous distension","crackles","rales","S3","S4","gallop","fatigue","exercise intolerance","DOE","PND","paroxysmal nocturnal dyspnea","new-onset","worsening"]},
      {"id":"medicare-echo-02","description":"No prior echocardiogram within the preceding 6 months","mandatory":true,"keywords":[]},
      {"id":"medicare-echo-03","description":"Clinical findings that would directly impact management decisions","mandatory":true,"keywords":["management","medication","treatment plan","surgical intervention","GDMT","guideline-directed","ejection fraction","valvular","regurgitation","stenosis","HFrEF","HFpEF","cardiomyopathy","monitoring","follow-up"]},
      {"id":"medicare-echo-04","description":"Elevated BNP or NT-proBNP when heart failure suspected","mandatory":false,"keywords":["BNP","NT-proBNP","brain natriuretic","elevated","pg/mL","cardiac biomarker","troponin"]},
      {"id":"medicare-echo-05","description":"Physical exam findings consistent with structural heart disease","mandatory":false,"keywords":["murmur","S3","S4","gallop","rub","click","displaced PMI","heave","thrill","irregularly irregular"]}
    ]'
  )
ON CONFLICT (payer_name, cpt_code) DO NOTHING;
