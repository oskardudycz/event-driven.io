import type { ArticleEdge } from '../../types/content.ts';
import * as styles from './Menu.module.css';
import React from 'react';

import {
  FaBookOpen,
  FaGithub,
  FaHome,
  FaLinkedin,
  FaMicrophone,
  FaRss,
  FaMastodon,
  FaYoutube,
  FaUserGraduate,
  FaHandshake,
} from 'react-icons/fa/';
import { FaSearch } from 'react-icons/fa/';
import { FaEnvelope } from 'react-icons/fa/';
import { FaTag } from 'react-icons/fa/';
import LanguagePicker from '../LanguagePicker/index.tsx';

import Item from './Item.tsx';
import BlueskyIcon from './BlueskyIcon.tsx';
import Expand from './Expand.tsx';
import { getOverflowedIndexes } from './overflow.ts';
import config from '../../../content/meta/config.ts';

type MenuProps = {
  path: string;
  fixed: boolean;
  screenWidth: number;
  fontLoaded: boolean;
  pages: ArticleEdge[];
};
type MenuState = { open: boolean; hiddenIndexes: number[]; measuring: boolean };

class Menu extends React.Component<MenuProps, MenuState> {
  resizeObserver?: ResizeObserver;
  itemList = React.createRef<HTMLUListElement>();
  container = React.createRef<HTMLElement>();
  containerWidth = 0;

  state: MenuState = { open: false, hiddenIndexes: [], measuring: false };

  // Gatsby preserves the layout during navigation. Read the current localized
  // page models rather than retaining a copy of the first page's props.
  get items() {
    const pages = this.props.pages.map((page) => ({
      to: page.node.fields.slug,
      label: page.node.frontmatter.menuTitle || page.node.frontmatter.title,
      icon:
        page.node.frontmatter.icon === 'FaUserGraduate'
          ? FaUserGraduate
          : page.node.frontmatter.icon === 'FaHandshake'
            ? FaHandshake
            : undefined,
    }));
    return [
      { to: '/', label: 'Start', icon: FaHome },
      { to: '/articles/', label: 'menu.articles', icon: FaBookOpen },
      { to: '/category/', label: 'menu.categories', icon: FaTag },
      ...pages,
      { to: '/contact/', label: 'menu.contact', icon: FaEnvelope },
      { to: '/talks/', label: 'menu.talks', icon: FaMicrophone },
      { to: '/search/', icon: FaSearch },
      { to: config.socialLinks.linkedin.url, icon: FaLinkedin },
      { to: config.socialLinks.github.url, icon: FaGithub },
      { to: config.socialLinks.mastodon.url, icon: FaMastodon },
      { to: config.socialLinks.bluesky.url, icon: BlueskyIcon },
      { to: config.socialLinks.youtube.url, icon: FaYoutube },
      { to: config.socialLinks.rss.url, icon: FaRss },
    ];
  }

  componentDidMount() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width === this.containerWidth) return;
        this.containerWidth = entry.contentRect.width;
        if (this.props.screenWidth > 0) {
          this.setState({ hiddenIndexes: [], measuring: true });
        }
      });
      // Header transitions change the available width after the window resize
      // handler. Observe the container, whose width is independent of hiding items.
      if (this.container.current) this.resizeObserver.observe(this.container.current);
    }
    if (this.props.screenWidth > 0) this.measureOverflow();
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  componentDidUpdate(prevProps: MenuProps) {
    if (
      this.props.path !== prevProps.path ||
      this.props.fixed !== prevProps.fixed ||
      this.props.screenWidth !== prevProps.screenWidth ||
      this.props.fontLoaded !== prevProps.fontLoaded ||
      this.props.pages !== prevProps.pages
    ) {
      // Reveal items through React for one measurement render. Lifecycle updates
      // finish before paint; refs only read dimensions, never mutate child DOM.
      this.setState({
        hiddenIndexes: [],
        measuring: true,
        open: this.props.path !== prevProps.path ? false : this.state.open,
      });
    } else if (this.state.measuring) {
      this.measureOverflow();
    }
  }

  measureOverflow = () => {
    const list = this.itemList.current;
    if (!list) return;
    const reservedWidth = this.props.screenWidth >= 1024 ? 60 : 0;
    const widths = Array.from(list.children, (item) => (item as HTMLElement).offsetWidth);
    this.setState({
      hiddenIndexes: getOverflowedIndexes(widths, list.offsetWidth - reservedWidth),
      measuring: false,
    });
  };

  toggleMenu = () => {
    this.setState((prevState) => ({ open: !prevState.open }));
  };

  render() {
    const { screenWidth } = this.props;
    const { open, hiddenIndexes } = this.state;
    const items = this.items;

    return (
      <React.Fragment>
        <nav
          className={`menu ${styles.menu} ${open ? `open ${styles.open}` : ''}`}
          rel="js-menu"
          ref={this.container}
        >
          <ul className={`itemList ${styles.itemList}`} ref={this.itemList}>
            {items.map((item, i) => (
              <Item
                item={item}
                key={item.to || i}
                overflowHidden={hiddenIndexes.includes(i) && !(open && screenWidth < 1024)}
              />
            ))}
          </ul>
          {hiddenIndexes.length > 0 && <Expand onClick={this.toggleMenu} open={open} />}
          {open && screenWidth >= 1024 && (
            <ul className={`hiddenItemList ${styles.hiddenItemList}`}>
              {hiddenIndexes.map((index) => (
                <Item item={items[index]} key={items[index].to} hiddenItem />
              ))}
            </ul>
          )}

          <LanguagePicker />
        </nav>
      </React.Fragment>
    );
  }
}

export default Menu;
