export type DynamicsParticipationType =
  | 'form'
  | 'external_url';

export interface DynamicCampaign {
  id: string;
  artworkLabel: string;
  title: string;
  deadline: string;
  context: string;
  participationType: DynamicsParticipationType;
  participationUrl: string | null;
  instructions: string;
  status: 'active' | 'closed';
}

export const dynamics: DynamicCampaign[] = [
  {
    id: 'tickets',
    artworkLabel: 'PROMOCIÓN',
    title: 'Gana boletos con LA Z',
    deadline: 'Hasta vie, 31 de mayo',
    context: 'LA Z 1310',
    participationType: 'form',
    participationUrl: null,
    instructions:
      'Completa el formulario de participación y envía tus datos antes del cierre.',
    status: 'active',
  },
  {
    id: 'trivia',
    artworkLabel: 'TRIVIA',
    title: 'Trivia musical de la semana',
    deadline: 'Hasta dom, 26 de mayo',
    context: 'LA Z 1310',
    participationType: 'form',
    participationUrl: null,
    instructions:
      'Responde la pregunta de la semana y registra tu participación.',
    status: 'active',
  },
  {
    id: 'code',
    artworkLabel: 'CÓDIGO AL AIRE',
    title: 'Código al aire',
    deadline: 'Disponible hoy',
    context: 'Durante LA Z 1310',
    participationType: 'external_url',
    participationUrl: null,
    instructions:
      'Escucha la transmisión, obtén el código y abre el enlace de participación.',
    status: 'active',
  },
  {
    id: 'survey',
    artworkLabel: 'ENCUESTA',
    title: 'Encuesta LA Z',
    deadline: 'Hasta dom, 26 de mayo',
    context: 'Tu opinión cuenta',
    participationType: 'form',
    participationUrl: null,
    instructions:
      'Completa la encuesta y envía tus respuestas desde la app.',
    status: 'active',
  },
];

const defaultCampaign = dynamics[0]!;

export function getDynamicCampaign(
  id: string | undefined,
): DynamicCampaign {
  return dynamics.find((item) => item.id === id) ?? defaultCampaign;
}
