# ORYN UX Polish — Phase 11

Phase 11 establishes shared production UX primitives rather than scattering one-off loading, error, confirmation, and feedback implementations across screens.

## Customer app
- `Skeleton` for content placeholders
- `StateView` for recoverable errors and retry actions
- `Toast` for short-lived action feedback

## Admin
- `ConfirmDialog` for destructive or consequential actions
- `InlineState` for recoverable workspace failures
- shared skeleton animation and focus-visible treatment
- responsive layout overrides for tablet and narrow desktop widths

The visual language remains editorial and restrained: square/fine-edged controls, strong typography, whitespace, borders, and minimal elevation.
