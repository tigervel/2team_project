import {
    Campaign as CampaignIcon,
    Help as HelpIcon,
} from '@mui/icons-material';

const adminNavigation = [
    {
        segment: 'board',
        title: '공지/문의',
        icon: <CampaignIcon />,
        children: [
            { segment: 'notice', title: '공지사항' },
            { segment: 'inquiry', title: '문의사항' },
        ],
    },
    {
        segment: 'member',
        title: '회원관리',
        icon: <CampaignIcon />,
        children: [
            { segment: 'memberList', title: '전체회원' },
            { segment: 'shipper', title: '화주' },
            { segment: 'carOwner', title: '차주' },
            { segment: 'Report', title: '신고내역' },
            { segment: 'admin', title: '관리자' },
        ],
    },
];

export default adminNavigation;