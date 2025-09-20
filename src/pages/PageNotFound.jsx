import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

const PageNotFoundPage = ({ isDarkMode }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black'
      }}
    >
      <img
        src="/404.png"
        alt="404"
        style={{
          width: '75%',
          height: '75%',
          objectFit: 'contain'
        }}
      />
      <div
        style={{
          position: 'relative',
          height: '25%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <p
          style={{
            fontSize: 40,
            color: isDarkMode ? 'white' : 'black'
          }}
        >
          {t('pageNotFound')}
        </p>

        <Button
          type="primary"
          size={'large'}
          onClick={() => {
            window.location.href = '/';
          }}
          block
        >
          {t('goHome')}
        </Button>
      </div>
    </div>
  );
};

export default PageNotFoundPage;
