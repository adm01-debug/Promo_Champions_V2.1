# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) | [Semantic Versioning](https://semver.org/)

## [3.0.0] - 2026-04-12

### Added
- ✅ TypeScript strict mode (`strict: true`, `strictNullChecks: true`) — zero erros
- 🔧 Husky + lint-staged — pre-commit hooks automatizados
- 📝 Commitlint — Conventional Commits enforced
- 🚫 ESLint `no-console` rule — previne logs em produção
- 📋 PR template com checklists de qualidade, segurança, performance e acessibilidade
- 📊 Script `build:analyze` — monitoramento de bundle size
- 📖 Runbook operacional (`docs/RUNBOOK.md`)
- 🔒 CORS centralizado em `_shared/cors.ts` para todas Edge Functions
- 🧪 2.636 testes (130 suites, 100% passing)

### Security
- Edge Functions CORS hardened (origin-restricted)
- Realtime policies audited

### Fixed
- 44 TypeScript strict mode errors across 30 files

## [2.0.0] - 2026-01-04

### Added
- 🚀 Complete offline support with service worker
- 🌐 Multi-language support (pt-BR, en-US, es-ES)
- 🎛️ Feature flags system with gradual rollout
- 🧪 A/B testing framework
- 📄 PDF generation with templates
- 🔗 Webhooks system with retry logic
- 👥 Real-time collaboration with presence
- 🔒 Enhanced RBAC permissions
- 🗄️ Materialized views for analytics
- 📊 Advanced stored procedures
- 🎙️ AI voice assistant integration
- 📤 Data export utilities (CSV, JSON, PDF)
- 📥 Data import utilities (CSV, XLSX, JSON)
- 📢 Advanced notification system
- 📈 Analytics tracking
- 🔍 Advanced search engine
- 🎯 Bulk actions component
- ⚡ Performance monitoring
- 💾 Advanced cache manager
- 🔐 CSRF protection
- 🧹 Input sanitization
- 🔑 Password policy enforcement
- 🔒 Data encryption utilities
- ⌨️ Keyboard shortcuts system
- 🎨 Progress bar components
- 🚨 Error boundary component
- 📊 Advanced data table
- ⏱️ Debounce/throttle utilities
- 🖼️ Lazy loading utilities
- 📝 11 TypeScript strict refactorings
- ✅ 7 E2E test suites
- 📚 Comprehensive documentation

### Enhanced
- Security with additional RLS policies
- Database performance with composite indexes
- Session management with auto-expiry
- Security headers configuration
- Login attempt tracking
- Data access logging

### Fixed
- Various TypeScript type issues
- Performance bottlenecks
- Security vulnerabilities

## [1.0.0] - 2025-12-01

### Added
- Initial release
- CRM core features
- Deal pipeline
- Client management
- Activity tracking
- Gamification system
- Basic analytics

---

For detailed changes, see [GitHub Releases](https://github.com/adm01-debug/salespro/releases)
