// Melhoria 82 - 2FA Setup Page
export const TwoFactorSetup = () => {
  const { qrCode, backupCodes, setup, verify, enabled } = use2FA();
  const [code, setCode] = useState('');

  const handleSetup = async () => {
    const result = await setup();
    // Show QR code and backup codes
  };

  const handleVerify = async () => {
    const isValid = await verify(code);
    if (isValid) {
      toast.success('2FA enabled successfully!');
    } else {
      toast.error('Invalid code');
    }
  };

  return (
    <div>
      {!qrCode && <Button onClick={handleSetup}>Enable 2FA</Button>}
      {qrCode && (
        <div>
          <img src={qrCode} alt="QR Code" />
          <p>Scan with Google Authenticator</p>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={handleVerify}>Verify</Button>
          
          <h3>Backup Codes (save them!):</h3>
          {backupCodes.map(c => <div key={c}>{c}</div>)}
        </div>
      )}
    </div>
  );
};
