import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { google } from "googleapis";

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
    const account = await prisma.youTubeAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const youtube = google.youtube("v3");

    // Get channel statistics
    const channelsResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ["statistics"],
      id: [account.youtubeChannelId],
    });

    const channel = channelsResponse.data.items?.[0];
    if (!channel?.statistics) {
      throw new Error("Failed to fetch channel statistics");
    }

    // Get videos for engagement calculation
    const videosResponse = await youtube.search.list({
      auth: oauth2Client,
      part: ["id"],
      channelId: account.youtubeChannelId,
      type: ["video"],
      maxResults: 50,
    });

    const videoIds =
      videosResponse.data.items
        ?.map((item) => item.id?.videoId)
        .filter(Boolean) || [];

    if (videoIds.length > 0) {
      const videosStatsResponse = await youtube.videos.list({
        auth: oauth2Client,
        part: ["statistics"],
        id: videoIds,
      });

      const videos = videosStatsResponse.data.items || [];

      // Calculate total engagement
      const totalViews = videos.reduce(
        (sum, video) => sum + parseInt(video.statistics?.viewCount || "0"),
        0
      );
      const totalLikes = videos.reduce(
        (sum, video) => sum + parseInt(video.statistics?.likeCount || "0"),
        0
      );
      const totalComments = videos.reduce(
        (sum, video) => sum + parseInt(video.statistics?.commentCount || "0"),
        0
      );

      const subscriberCount = parseInt(
        channel.statistics.subscriberCount || "0"
      );

      // Prepare analytics data
      const analyticsData = {
        youtubeAccountId: accountId,
        userId: account.userId,
        date: new Date(),
        subscribers: subscriberCount,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: 0, // YouTube doesn't provide share count in basic API
        watchTime: 0, // Would need Analytics API for this
        engagement:
          ((totalLikes + totalComments) / (subscriberCount || 1)) * 100,
      };

      // Save to database
      const savedAnalytics = await prisma.youTubeAnalytics.upsert({
        where: {
          youtubeAccountId_date: {
            youtubeAccountId: accountId,
            date: new Date(),
          },
        },
        update: analyticsData,
        create: analyticsData,
      });

      return NextResponse.json(savedAnalytics);
    } else {
      // No videos found, save basic channel data
      const analyticsData = {
        youtubeAccountId: accountId,
        userId: account.userId,
        date: new Date(),
        subscribers: parseInt(channel.statistics.subscriberCount || "0"),
        views: parseInt(channel.statistics.viewCount || "0"),
        likes: 0,
        comments: 0,
        shares: 0,
        watchTime: 0,
        engagement: 0,
      };

      const savedAnalytics = await prisma.youTubeAnalytics.upsert({
        where: {
          youtubeAccountId_date: {
            youtubeAccountId: accountId,
            date: new Date(),
          },
        },
        update: analyticsData,
        create: analyticsData,
      });

      return NextResponse.json(savedAnalytics);
    }
  } catch (error) {
    console.error("YouTube analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube analytics" },
      { status: 500 }
    );
  }
}
