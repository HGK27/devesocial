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
    const account = await prisma.tikTokAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Fetch TikTok user info
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/",
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch TikTok user info");
    }

    const userData = await userResponse.json();

    // Fetch TikTok videos for engagement calculation
    const videosResponse = await fetch(
      "https://open.tiktokapis.com/v2/video/list/",
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!videosResponse.ok) {
      throw new Error("Failed to fetch TikTok videos");
    }

    const videosData = await videosResponse.json();

    // Calculate total engagement
    const totalViews =
      videosData.data?.videos?.reduce(
        (sum: number, video: any) => sum + (video.stats?.view_count || 0),
        0
      ) || 0;
    const totalLikes =
      videosData.data?.videos?.reduce(
        (sum: number, video: any) => sum + (video.stats?.like_count || 0),
        0
      ) || 0;
    const totalComments =
      videosData.data?.videos?.reduce(
        (sum: number, video: any) => sum + (video.stats?.comment_count || 0),
        0
      ) || 0;
    const totalShares =
      videosData.data?.videos?.reduce(
        (sum: number, video: any) => sum + (video.stats?.share_count || 0),
        0
      ) || 0;

    const followerCount = userData.data?.user?.follower_count || 0;

    // Prepare analytics data
    const analyticsData = {
      tiktokAccountId: accountId,
      userId: account.userId,
      date: new Date(),
      followers: followerCount,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      engagement:
        ((totalLikes + totalComments + totalShares) / (followerCount || 1)) *
        100,
    };

    // Save to database
    const savedAnalytics = await prisma.tikTokAnalytics.upsert({
      where: {
        tiktokAccountId_date: {
          tiktokAccountId: accountId,
          date: new Date(),
        },
      },
      update: analyticsData,
      create: analyticsData,
    });

    return NextResponse.json(savedAnalytics);
  } catch (error) {
    console.error("TikTok analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch TikTok analytics" },
      { status: 500 }
    );
  }
}
