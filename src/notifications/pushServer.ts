const SERVER_URL = 'https://aviso-laboratorio-worker.nunezjuan7990.workers.dev/send';

interface ServerReply {
  accepted?: boolean;
  ticketId?: string;
  error?: string;
}

export async function requestPushFromServer(token: string): Promise<string> {
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data: ServerReply = await response.json();
  if (!response.ok || !data.accepted) {
    throw new Error(data.error ?? 'Solicitud rechazada');
  }
  return data.ticketId ?? 'sin número de ticket';
}
