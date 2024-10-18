import React from 'react';
import { Helmet } from 'react-helmet-async';

type PageTitleProps = {
    title: string;
};

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
    return (
        <Helmet>
            <title>{title}</title>
        </Helmet>
    );
};

export default PageTitle;
