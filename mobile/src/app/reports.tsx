import ReportWizard from '../components/report-wizard';
import { useAuth } from '../state/auth-state';

export default function Reports() {
  const auth = useAuth();
  return <ReportWizard key={auth.demo ? 'demo' : auth.session?.user.id ?? 'signed-out'} />;
}
