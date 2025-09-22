import yellowNetworkService from '@/services/YellowNetworkService';

export async function GET(request) {
  try {
    // Initialize and connect (no token required for Sandbox)
    await yellowNetworkService.initialize();
    if (!yellowNetworkService.isConnected) {
      await yellowNetworkService.connect();
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create') {
      const gameType = (searchParams.get('gameType') || 'MINES').toString();
      const session = await yellowNetworkService.createGameSession(gameType, {});
      return new Response(
        JSON.stringify({
          ok: true,
          action: 'create',
          channelId: yellowNetworkService.channelId,
          session,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        connected: yellowNetworkService.isConnected,
        channelId: yellowNetworkService.channelId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const gameType = (body?.gameType || 'MINES').toString();
    const gameConfig = body?.gameConfig || {};

    await yellowNetworkService.initialize();
    if (!yellowNetworkService.isConnected) {
      await yellowNetworkService.connect();
    }

    const session = await yellowNetworkService.createGameSession(gameType, gameConfig);

    return new Response(
      JSON.stringify({
        ok: true,
        channelId: yellowNetworkService.channelId,
        session,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


