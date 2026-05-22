<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this Expo (React Native) subscription management app. The following changes were made:

- **`posthog-react-native`** and **`react-native-svg`** (peer dependency) were installed via `npx expo install`.
- **`app.config.js`** was created to replace `app.json` as the dynamic Expo config, injecting `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from the environment into `Constants.expoConfig.extra`.
- **`src/config/posthog.ts`** was created as the shared PostHog client instance, configured using `expo-constants`.
- **`app/_layout.tsx`** was updated to wrap the app tree in `PostHogProvider` and add manual screen tracking using `usePathname` / `useGlobalSearchParams` from `expo-router`.
- **`app/(auth)/sign-in.tsx`** was updated to call `posthog.identify()` and capture `user_signed_in` when sign-in finalizes.
- **`app/(auth)/sign-up.tsx`** was updated to call `posthog.identify()` and capture `user_signed_up` when registration finalizes.
- **`app/(tabs)/settings.tsx`** was updated to capture `user_signed_out` and call `posthog.reset()` on logout.
- **`app/(tabs)/index.tsx`** was updated to capture `subscription_expanded` with subscription id/name when a card is expanded.
- **`app/subscriptions/[id].tsx`** was updated to capture `subscription_details_viewed` with the subscription id on mount.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a user successfully completes account registration | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | Fired when a user successfully signs in | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | Fired when a user signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | Fired when a user expands a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | Fired when a user opens the subscription detail screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/699209)
- [New sign-ups over time](/insights/7ZXteaZ4)
- [Sign-up to sign-in conversion funnel](/insights/PEcPUAWW)
- [Subscription engagement over time](/insights/pMXs4G1Q)
- [User churn (sign-outs) over time](/insights/8J1hoYO2)
- [Subscription details views over time](/insights/Rz9ohfYQ)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
