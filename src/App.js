import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import styled from 'styled-components';
import { Loading } from './components/Loading';
import { Label } from './components/Label';
import { Button } from './components/Button';

const StyledList = styled.ul`
    list-style: none;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 0;
    margin: 0 10px;
`;
const StyledFormWrapper = styled.div`
    display: flex;
    align-items: center;
    margin: 10px;
    * {
        margin-right: 10px;
    }
`;

const SearchResult = ({ title, snippet }) => {
    return (
        <li>
            <h2>{title}</h2>
            <div
                dangerouslySetInnerHTML={{
                    __html: snippet,
                }}
            />
        </li>
    );
};

const App = () => {
    const inputEl = useRef(null);
    const [searchPhrase, setSearchPhrase] = useState('');
    const [search, setSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [replacePhrase, setReplacePhrase] = useState('');

    useEffect(() => {
        if (searchPhrase) {
            setIsSearching(true);
            setSearchResults([]);
            axios
                .get(`https://en.wikipedia.org/w/api.php`, {
                    params: {
                        action: 'query',
                        list: 'search',
                        format: 'json',
                        srsearch: searchPhrase,
                        srlimit: 10,
                    },
                })
                .then(
                    ({
                        data: {
                            query: { search: searchResult },
                        },
                    }) => {
                        setSearchResults(searchResult);
                    },
                )
                .catch((e) => {
                    console.error(e);
                })
                .then(() => {
                    setIsSearching(false);
                });
        } else {
            setSearchResults([]);
        }
    }, [searchPhrase, search]);

    return (
        <>
            <StyledFormWrapper>
                <Label text="Search" value={searchPhrase}>
                    <input
                        ref={inputEl}
                        type="text"
                        onChange={debounce(() => {
                            setSearchPhrase(inputEl.current.value);
                        }, 1000)}
                    />
                </Label>

                <Button type="button" disabled={isSearching} onClick={() => setSearch((state) => !state)}>
                    Search
                </Button>
            </StyledFormWrapper>
            <StyledFormWrapper>
                <Label text="Replace" value={replacePhrase}>
                    <input
                        type="text"
                        onChange={({ target: { value } }) => {
                            setReplacePhrase(value);
                        }}
                    />
                </Label>

                <Button
                    type="button"
                    disabled={isSearching}
                    onClick={() => {
                        const toReplace = [...searchResults];
                        const regex = new RegExp(`<span class="searchmatch">${searchPhrase}</span>`, 'i');
                        for (let i = 0; i < toReplace.length; i++) {
                            if (toReplace[i].snippet.match(regex)) {
                                toReplace[i].snippet = toReplace[i].snippet.replace(regex, () => replacePhrase);
                                setSearchResults(toReplace);
                                break;
                            }
                        }
                    }}
                >
                    Replace
                </Button>
                <Button
                    type="button"
                    disabled={isSearching}
                    onClick={() => {
                        const regex = new RegExp(`<span class="searchmatch">${searchPhrase}</span>`, 'gi');
                        const toReplace = searchResults.map((item) => {
                            return {
                                ...item,
                                snippet: item.snippet.replace(regex, () => replacePhrase),
                            };
                        });
                        setSearchResults(toReplace);
                    }}
                >
                    Replace all
                </Button>
            </StyledFormWrapper>
            {isSearching && <Loading />}
            {!isSearching && (
                <StyledList>
                    {searchResults.map((item) => (
                        <SearchResult key={item.pageid} {...item} />
                    ))}
                </StyledList>
            )}
        </>
    );
};

export default App;
