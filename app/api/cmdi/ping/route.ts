import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { requireAuth } from '@/lib/auth';

// Command Injection lab. Input `host` langsung masuk ke string perintah shell
// (exec), sehingga attacker bisa menyisipkan perintah tambahan.

function runCommand(cmd: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error ? (error.code ?? 1) : 0,
      });
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const host = request.nextUrl.searchParams.get('host') || '';
    if (!host) {
      return NextResponse.json({ error: 'Missing host parameter' }, { status: 400 });
    }

    // VULNERABLE: user input di-concat ke perintah shell.
    // Contoh payload: 127.0.0.1; id   atau   127.0.0.1 && cat /etc/passwd
    const command = `ping -c 2 ${host}`;
    const { stdout, stderr, exitCode } = await runCommand(command);

    return NextResponse.json({ command, stdout, stderr, exitCode });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
