import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, Lock, ShieldCheck, X } from 'lucide-react';
import type { AdminAuthMode } from '../utils/submissions';

interface AdminAuthModalProps {
  open: boolean;
  authMode: AdminAuthMode;
  apiUnavailable: boolean;
  onClose: () => void;
  onAuthenticated: (token: string, nextMode: AdminAuthMode, pendingCount: number) => void;
}

export function AdminAuthModal({
  open,
  authMode,
  apiUnavailable,
  onClose,
  onAuthenticated,
}: AdminAuthModalProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPasscode('');
      setConfirmPasscode('');
      setErrorMsg(null);
      setSubmitting(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isClaimMode = authMode === 'unclaimed';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || apiUnavailable) return;
    setErrorMsg(null);

    const trimmed = passcode.trim();
    if (!trimmed) {
      setErrorMsg('请输入管理员密码');
      return;
    }

    if (isClaimMode) {
      if (trimmed.length < 8) {
        setErrorMsg('首次设置的管理员密码至少需要 8 位字符');
        return;
      }
      if (trimmed !== confirmPasscode.trim()) {
        setErrorMsg('两次输入的密码不一致，请重新确认');
        return;
      }
    }

    setSubmitting(true);
    try {
      const endpoint = isClaimMode
        ? '/api/moderation/auth/claim'
        : '/api/moderation/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error('当前站点未连接到后端服务，请确认已使用全栈服务启动');
      }

      const data = (await res.json()) as {
        token?: string;
        authMode?: AdminAuthMode;
        pendingCount?: number;
        error?: string;
      };

      if (!res.ok || !data.token) {
        setErrorMsg(data.error ?? '验证未通过，请重试');
        return;
      }

      onAuthenticated(
        data.token,
        data.authMode ?? (isClaimMode ? 'claimed' : authMode),
        Number(data.pendingCount ?? 0)
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-auth-title"
      data-testid="admin-auth-modal"
      className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/78 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel-enter w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-shelf)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {isClaimMode ? (
              <ShieldCheck className="w-4.5 h-4.5 text-[var(--brass)] shrink-0" aria-hidden="true" />
            ) : (
              <Lock className="w-4.5 h-4.5 text-[var(--brass)] shrink-0" aria-hidden="true" />
            )}
            <h2
              id="admin-auth-title"
              className="font-mincho font-normal text-[19px] text-[var(--text-primary)]"
            >
              {isClaimMode ? '首次启用管理后台' : '管理员验证'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭管理员验证窗口"
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {apiUnavailable ? (
            <div className="space-y-3 text-xs leading-[1.85] text-[var(--text-secondary)]">
              <p className="text-[var(--accent)] font-medium">
                当前站点未检测到后端审核服务。
              </p>
              <p>
                如果你是通过纯静态托管（仅上传了打包后的前端页面）部署本站，后端的纠错提交与后台审核接口不会运行；使用包含后端服务的启动方式运行后，再访问{' '}
                <code className="px-1 py-0.5 bg-[var(--bg-inset)] text-[var(--brass)]">/#admin</code>{' '}
                即可解锁管理后台。
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--brass)] cursor-pointer"
                >
                  知道了
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs leading-[1.8] text-[var(--text-muted)]">
                {isClaimMode
                  ? '检测到尚未配置管理密码。请先设置一个至少 8 位的管理员密码（服务端加盐加密保存，设定后即锁定），也可以随时在部署环境变量中配置 ADMIN_PASSCODE 覆盖。'
                  : '请输入管理员密码以解锁右上角「管理」后台与详情页「直接生效」权限。会话仅保留在当前页面内存中。'}
              </p>

              <div>
                <label
                  htmlFor="admin-passcode-input"
                  className="block text-xs text-[var(--text-secondary)] mb-1.5"
                >
                  {isClaimMode ? '设置管理员密码（至少 8 位）' : '管理员密码'}
                </label>
                <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-strong)]/70 focus-within:border-[var(--brass)] transition-colors">
                  <KeyRound
                    className="w-3.5 h-3.5 text-[var(--text-muted)] ml-3 shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-passcode-input"
                    data-testid="admin-passcode-input"
                    type="password"
                    autoFocus
                    autoComplete={isClaimMode ? 'new-password' : 'current-password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={isClaimMode ? '输入 8 位以上密码' : '输入管理员密码'}
                    className="w-full px-2.5 py-2.5 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                </div>
              </div>

              {isClaimMode && (
                <div>
                  <label
                    htmlFor="admin-passcode-confirm"
                    className="block text-xs text-[var(--text-secondary)] mb-1.5"
                  >
                    确认管理员密码
                  </label>
                  <input
                    id="admin-passcode-confirm"
                    data-testid="admin-passcode-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="再次输入同一密码"
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg-input)] border border-[var(--border-strong)]/70 focus:border-[var(--brass)] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors"
                  />
                </div>
              )}

              {errorMsg && (
                <p
                  data-testid="admin-auth-error"
                  role="alert"
                  className="text-xs text-[var(--accent)]"
                >
                  {errorMsg}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  data-testid="admin-auth-submit-btn"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? '验证中…'
                    : isClaimMode
                      ? '设定密码并进入后台'
                      : '验证并进入后台'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
