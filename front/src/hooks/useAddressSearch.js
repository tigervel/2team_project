import { useState } from 'react';

export default function useAddressSearch(apiKey) {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setSearchQuery('');
    setSearchResults([]);
    setOpenDialog(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(searchQuery)}&analyze_type=exact`,
        {
          headers: { Authorization: `KakaoAK ${apiKey}` },
        }
      );

      const data = await res.json();
      setSearchResults(data.documents || []);
    } catch (err) {
      console.error('주소 검색 실패:', err);
    }
  };

  const handleSelectAddress = (item) => {
    setSelectedAddress(item.address_name);
    handleCloseDialog();
  };

  return {
    openDialog,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedAddress,
    handleOpenDialog,
    handleCloseDialog,
    handleSearch,
    handleSelectAddress,
  };
}
