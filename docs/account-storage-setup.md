# Private account avatar storage setup

CloudWise uses the private Supabase Storage bucket `cloudwise-avatars` for account pictures. The browser stores one object at `<authenticated-user-uuid>/avatar`; it does not store public URLs. The client accepts JPG, PNG, and WebP files up to 2 MiB. Objects are downloaded through the authenticated Storage API, so they are not publicly readable. The app holds the downloaded image as an in-memory Blob URL for the current page and downloads it again after a reload; it does not persist an expiring signed URL. Avatar uploads use a zero-second cache lifetime so overwriting the same object path is less likely to show a stale cached image.

## Check before applying

The repository's earlier learning-progress migration does not create an avatar bucket or Storage policies. The deployed Supabase project was not queried during this implementation, so its bucket and `storage.objects` policy state is unknown. Before applying the migration, inspect **Supabase Dashboard → Storage → Buckets** and **Authentication/Storage policies** for a bucket named `cloudwise-avatars` and any broad policies on `storage.objects`. Do not leave another permissive policy that grants public or cross-user access to this bucket.

## Configure the project

1. In the Supabase Dashboard, open **SQL Editor → New query**.
2. Review and run `supabase/migrations/20261021120000_create_private_avatar_storage.sql` once. It creates or enforces a private bucket with a 2 MiB limit and the supported image MIME types, then adds authenticated select/insert/update policies scoped to the first object-path folder matching `auth.uid()`. No delete policy is created because the UI does not delete avatars.
3. In **Storage → Buckets**, confirm `cloudwise-avatars` is private and the size/type restrictions are set.
4. In **Storage → Policies**, confirm the three `cloudwise_avatar_*_own` policies exist. Review other policies that apply to `storage.objects`; permissive policies combine with OR and could broaden access if they match this bucket.
5. Keep the browser configured only with the Supabase project URL and publishable key. Never use a service-role or secret key in a `VITE_` variable.

## Verification after configuration

Use two authorized test accounts. Sign in as user A, upload an allowed image, reload, and confirm the private image loads. Sign in as user B and confirm the app shows initials until B uploads an image. Verify B cannot download or replace A's object through the authenticated Storage API; verify an unauthenticated request cannot read it. Also test unsupported type, image larger than 2 MiB, and a missing bucket/policy error. Do not treat mocked repository tests or a successful build as proof of Storage RLS behavior.

The client currently displays an upload loading state; the standard upload call does not report byte-level percentage progress. Profile display names use Supabase Auth `user_metadata` and are presentation data only, never authorization claims. No separate profile table is required for this feature.
