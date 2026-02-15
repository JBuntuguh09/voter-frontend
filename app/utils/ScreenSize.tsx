import { useState, useEffect } from 'react';

type ScreenSize = 'mobile'|'small' | 'medium' | 'large';

const useScreenSize = (): ScreenSize => {
    const [screenSize, setScreenSize] = useState<ScreenSize>('large');
    

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.matchMedia('(max-width: 767px)').matches) {
                setScreenSize('mobile');
              //  console.log(window.innerWidth)
            } else if (window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches) {
                setScreenSize('medium');
            } else {
                setScreenSize('large');
            }
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return screenSize;
};

export default useScreenSize