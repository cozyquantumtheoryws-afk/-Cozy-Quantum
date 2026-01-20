
# Hard Constraints for The Waveform Handyman

## Pricing Policy
- **Strict Pricing**: Digital products (ebooks/audiobooks) are strictly $1.99 – $2.99.
- **No Subscriptions**: Never suggest or implement subscription models (SaaS). One-time purchases only.
- **No Ads**: The experience must remain premium and ad-free.

## Content Guardrails
- **No World-Ending Stakes**: The world is never in danger. The stakes are personal (ruined dinner, lost cat, noisy pipes).
- **Family Friendly**: Content should be safe for all ages, though aimed at adults who need a cozy escape.
- **Length**: eBooks should be novella-length (~12,000 words).

## Technical Constraints
- **Stack**: Vercel (Hosting), Supabase (DB/Auth/Vector), Stripe (Payments).
- **Deployment**: All web changes must go through the GitHub -> Vercel pipeline.
