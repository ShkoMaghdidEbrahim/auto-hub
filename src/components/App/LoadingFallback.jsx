import { useTranslation } from 'react-i18next';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        transition: 'opacity 0.5s ease-in-out',
        opacity: 1
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 40
        }}
      >
        <LoadingOutlined
          style={{
            fontSize: 100,
            display: 'block',
            margin: 'auto'
          }}
        />
        <p
          style={{
            fontSize: 25,
            fontWeight: 'bold'
          }}
        >
          {t('loading')}
        </p>
      </div>
    </div>
  );
};

export default LoadingFallback;
