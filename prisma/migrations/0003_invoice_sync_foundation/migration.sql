-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "project_id" UUID,
    "gc_company_id" UUID,
    "external_provider" TEXT NOT NULL DEFAULT 'quickbooks_online',
    "external_invoice_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "customer_external_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "txn_date" DATE,
    "due_date" DATE,
    "accounting_status" TEXT NOT NULL DEFAULT 'unknown',
    "follow_up_status" TEXT NOT NULL DEFAULT 'none',
    "gc_status" TEXT NOT NULL DEFAULT 'unknown',
    "private_note" TEXT,
    "quickbooks_updated_at" TIMESTAMPTZ(6),
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_follow_up_notes" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "follow_up_status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_follow_up_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_organization_id_external_provider_external_invoice_id_key" ON "invoices"("organization_id", "external_provider", "external_invoice_id");

-- CreateIndex
CREATE INDEX "invoices_organization_id_accounting_status_idx" ON "invoices"("organization_id", "accounting_status");

-- CreateIndex
CREATE INDEX "invoices_organization_id_follow_up_status_idx" ON "invoices"("organization_id", "follow_up_status");

-- CreateIndex
CREATE INDEX "invoices_organization_id_due_date_idx" ON "invoices"("organization_id", "due_date");

-- CreateIndex
CREATE INDEX "invoices_project_id_idx" ON "invoices"("project_id");

-- CreateIndex
CREATE INDEX "invoices_gc_company_id_idx" ON "invoices"("gc_company_id");

-- CreateIndex
CREATE INDEX "invoice_follow_up_notes_organization_id_created_at_idx" ON "invoice_follow_up_notes"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "invoice_follow_up_notes_invoice_id_created_at_idx" ON "invoice_follow_up_notes"("invoice_id", "created_at");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_gc_company_id_fkey" FOREIGN KEY ("gc_company_id") REFERENCES "gc_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_follow_up_notes" ADD CONSTRAINT "invoice_follow_up_notes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_follow_up_notes" ADD CONSTRAINT "invoice_follow_up_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_follow_up_notes" ADD CONSTRAINT "invoice_follow_up_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
