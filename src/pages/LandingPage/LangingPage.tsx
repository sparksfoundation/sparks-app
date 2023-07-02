import { useNavigate } from 'react-router-dom';
import { Button, H1, P } from 'sparks-ui';
import { IntroCard } from '@components/IntroCard';

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
      <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-4xl mx-auto">
        <H1 className="text-center mb-2 ">SPARKS</H1>
        <P className="text-center text-xl sm:text-2xl mb-6">Get started with your SPARKS Identity</P>
        <div className="w-full flex items-center justify-center">
          <IntroCard
            className="hidden 800:block"
            title="Your Identity"
            description="Add, update and manage digital identity credentials!"
            items={['Email & Phone', 'Social Accounts', 'Web3 Accounts', 'Domains & More']}
          />
          <IntroCard
            highlighted
            className="z-10 -mx-3"
            title="Get Started Now"
            description="Getting started is easy! Click below to follow setup steps."
            items={['Name your identity', 'Provide a password', 'Add your credentials', 'Reclaim your identity!']}
            footer={<Button fullWidth onClick={() => navigate('/auth/create')}>Create</Button>}
          />
          <IntroCard
            className="hidden 800:block"
            title="Apps & Services"
            description="Access apps and services with your SPARKS Identity!"
            items={['No more sign-ups', 'Safer, smaller footprint', 'Unlocked data value', 'Better user experience']}
          />
        </div>
      </div>
  )
}
