/**
 * Адреса прежнего каталога (он совпадал с каталогом buydone.tech) → новые.
 * На них отвечаем постоянным редиректом (301): уже проиндексированные
 * страницы передают позиции новым, а не превращаются в 404.
 * Держать в согласии с LEGACY_SERVICE_SLUGS в бэкенде (src/seed/services.data.ts).
 */
export const LEGACY_SERVICE_REDIRECTS: Record<string, string> = {
  'web-development': 'saas-mvp-sprint',
  'mobile-development': 'react-native-engineering',
  'ux-ui-design': 'design-system-foundations',
  'devops-cloud': 'terraform-infrastructure-code',
  'data-analytics-bi': 'metabase-looker-dashboards',
  'support-sla': 'developer-on-call',
  'integrations-api': 'third-party-api-connectors',
  'monitoring-observability': 'grafana-prometheus-stack',
  'frontend-development': 'react-nextjs-engineering',
  'backend-development': 'node-nestjs-api-engineering',
  'mobile-feature-work': 'react-native-engineering',
  'wordpress-cms': 'wordpress-plugin-engineering',
  'bug-fixing': 'ad-hoc-developer-hours',
  'manual-qa-testing': 'exploratory-qa-sessions',
  'test-automation': 'playwright-e2e-suites',
  'ui-screen-design': 'figma-interface-design-hours',
  'landing-page-design': 'landing-conversion-redesign',
  'brand-graphics': 'motion-and-illustration',
  'devops-hourly': 'ci-pipeline-engineering',
  'server-administration': 'linux-hardening-patching',
  'data-engineering': 'warehouse-ingestion-pipelines',
  'bi-dashboards': 'metabase-looker-dashboards',
  'monitoring-setup': 'alert-tuning-runbooks',
  'technical-support': 'remote-it-helpdesk',
  'website-maintenance': 'site-health-plan',
  'tech-consulting': 'fractional-cto-advisory',
};
