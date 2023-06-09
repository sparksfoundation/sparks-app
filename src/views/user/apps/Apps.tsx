import { useLocation } from 'react-router-dom';
import * as services from './Services';

export const Apps = () => {
  const location = useLocation()

  return (
    <div>
      {Object.keys(services).map(key => {
        const Component = services[key as keyof typeof services]
        return <Component key={`app_${key}`} connectionWaiting={key === location?.state?.prev?.params?.connect } />
      })}
    </div>
  )
}