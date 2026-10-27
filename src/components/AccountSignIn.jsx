import { useState } from 'react';

export default function AccountSignIn({ onEmailPasswordAuth, onSocialLogin }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await onEmailPasswordAuth(email, password, register);
      if (result?.message) setMessage(result.message);
    } catch (error) {
      setMessage(error.message || 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return <div className="account-inline-auth">
    <h4>Sign in or create an account</h4>
    <div className="flex flex-wrap gap-2">
      {['google', 'facebook'].map(provider => <button type="button" key={provider}
        disabled={busy} onClick={() => onSocialLogin(provider)}>Sign in with {provider === 'google' ? 'Google' : 'Facebook'}</button>)}
    </div>
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label>Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy} type="submit">{busy ? 'Connecting...' : register ? 'Create account' : 'Sign in'}</button>
      <button type="button" onClick={() => setRegister(!register)}>{register ? 'Use an existing account' : 'Create a new account instead'}</button>
    </form>
    {message && <p role="status">{message}</p>}
  </div>;
}
