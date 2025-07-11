import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Get account info
    const account = await prisma.instagramAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Fetch Instagram insights
    const insightsResponse = await fetch(
      `https://graph.instagram.com/me/insights?metric=impressions,reach,profile_views&access_token=${account.accessToken}`
    );

    if (!insightsResponse.ok) {
      throw new Error("Failed to fetch Instagram insights");
    }

    const insightsData = await insightsResponse.json();

    // Fetch media data for engagement calculation
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&access_token=${account.accessToken}`
    );

    if (!mediaResponse.ok) {
      throw new Error("Failed to fetch Instagram media");
    }

    const mediaData = await mediaResponse.json();

    // Calculate total engagement
    const totalLikes =
      mediaData.data?.reduce(
        (sum: number, post: any) => sum + (post.like_count || 0),
        0
      ) || 0;
    const totalComments =
      mediaData.data?.reduce(
        (sum: number, post: any) => sum + (post.comments_count || 0),
        0
      ) || 0;

    // Get follower count (you might need to use a different endpoint)
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=followers_count&access_token=${account.accessToken}`
    );

    const profileData = await profileResponse.json();

    // Prepare analytics data
    const analyticsData = {
      instagramAccountId: accountId,
      userId: account.userId,
      date: new Date(),
      followers: profileData.followers_count || 0,
      reach:
        insightsData.data?.find((item: any) => item.name === "reach")
          ?.values?.[0]?.value || 0,
      impressions:
        insightsData.data?.find((item: any) => item.name === "impressions")
          ?.values?.[0]?.value || 0,
      engagement:
        ((totalLikes + totalComments) / (profileData.followers_count || 1)) *
        100,
      likes: totalLikes,
      comments: totalComments,
      shares: 0, // Instagram doesn't provide share count in basic API
      saves: 0, // Instagram doesn't provide save count in basic API
    };

    // Save to database
    const savedAnalytics = await prisma.instagramAnalytics.upsert({
      where: {
        instagramAccountId_date: {
          instagramAccountId: accountId,
          date: new Date(),
        },
      },
      update: analyticsData,
      create: analyticsData,
    });

    return NextResponse.json(savedAnalytics);
  } catch (error) {
    console.error("Instagram analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram analytics" },
      { status: 500 }
    );
  }
}
