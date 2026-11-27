export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/') {
      return Response.json({ status: 'ready' });
    }
    if (request.method !== 'POST' || path !== '/send') {
      return Response.json({ error: 'Use POST /send' }, { status: 405 });
    }
    let input;
    try {
      input = await request.json();
    } catch {
      return Response.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const token = input?.token;
    if (
      typeof token !== 'string' ||
      !/^Expo(nent)?PushToken\[.+\]$/.test(token)
    ) {
      return Response.json({ error: 'Token no válido' }, { status: 400 });
    }
    const time = new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
    });
    const code = crypto.randomUUID().slice(0, 8).toUpperCase();
    try {
      const upstream = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: 'Aviso desde el servidor',
          body: `Hora del servidor: ${time}. Código: ${code}`,
          sound: 'default',
          channelId: 'laboratorio',
        }),
      });
      const payload = await upstream.json();
      const ticket = payload?.data;
      if (!upstream.ok || ticket?.status !== 'ok') {
        return Response.json(
          {
            error: 'Expo rechazó el envío',
            detail: ticket?.message ?? payload?.errors ?? null,
          },
          { status: 502 }
        );
      }
      return Response.json({ accepted: true, ticketId: ticket.id });
    } catch {
      return Response.json({ error: 'Sin conexión con Expo' }, { status: 502 });
    }
  },
};
