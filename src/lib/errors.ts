export function formatError(err: unknown): { title: string; description: string } {
  // Não expor detalhes técnicos ao utilizador
  return {
    title: 'Algo correu mal',
    description: 'Tente novamente. Se o problema persistir, contacte o suporte.',
  };
}
