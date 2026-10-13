export const GOOGLE_TRACKING = {
  analyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-RAHASIA",
  tagManagerId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || "GTM-RAHASIA",
} as const;

function isConfiguredId(value: string, prefix: "G" | "GTM"): boolean {
  return (
    new RegExp(`^${prefix}-[A-Z0-9]+$`).test(value) &&
    !/RAHASIA|PLACEHOLDER|^G(?:TM)?-X+$/.test(value)
  );
}

export function getGoogleTrackingConfig(
  config: {
    analyticsId: string;
    tagManagerId: string;
  } = GOOGLE_TRACKING,
) {
  const enabled =
    process.env.NODE_ENV === "production" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");

  if (!enabled) return { analyticsId: null, tagManagerId: null };

  const tagManagerId = config.tagManagerId.trim();
  if (isConfiguredId(tagManagerId, "GTM")) {
    return { analyticsId: null, tagManagerId };
  }

  const analyticsId = config.analyticsId.trim();
  return {
    analyticsId: isConfiguredId(analyticsId, "G") ? analyticsId : null,
    tagManagerId: null,
  };
}
