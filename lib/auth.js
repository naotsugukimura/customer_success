export function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  return token === process.env.ADMIN_TOKEN;
}
