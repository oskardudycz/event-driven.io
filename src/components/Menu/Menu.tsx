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
} from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { FaEnvelope } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import LanguagePicker from '../LanguagePicker/index.tsx';
import ThemePicker from '../ThemePicker/ThemePicker.tsx';

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
  expandButton = React.createRef<HTMLButtonElement>();
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
      { to: '/search/', label: 'menu.search', icon: FaSearch, iconOnly: true },
      {
        to: config.socialLinks.linkedin.url,
        label: 'LinkedIn',
        icon: FaLinkedin,
        iconOnly: true,
      },
      {
        to: config.socialLinks.github.url,
        label: 'GitHub',
        icon: FaGithub,
        iconOnly: true,
      },
      {
        to: config.socialLinks.mastodon.url,
        label: 'Mastodon',
        icon: FaMastodon,
        iconOnly: true,
      },
      {
        to: config.socialLinks.bluesky.url,
        label: 'Bluesky',
        icon: BlueskyIcon,
        iconOnly: true,
      },
      {
        to: config.socialLinks.youtube.url,
        label: 'YouTube',
        icon: FaYoutube,
        iconOnly: true,
      },
      {
        to: config.socialLinks.rss.url,
        label: 'RSS',
        icon: FaRss,
        iconOnly: true,
      },
    ];
  }

  componentDidMount() {
    document.addEventListener('pointerdown', this.handleOutsidePointer);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;
        if (entry.contentRect.width === this.containerWidth) return;
        this.containerWidth = entry.contentRect.width;
        if (this.props.screenWidth > 0) {
          this.setState({ hiddenIndexes: [], measuring: true });
        }
      });
      // Header transitions change the available width after the window resize
      // handler. Observe the container, whose width is independent of hiding items.
      if (this.container.current)
        this.resizeObserver.observe(this.container.current);
    }
    if (this.props.screenWidth > 0) this.setState({ measuring: true });
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('pointerdown', this.handleOutsidePointer);
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
    const widths = Array.from(
      list.children,
      (item) => (item as HTMLElement).offsetWidth,
    );
    let availableWidth = list.clientWidth;
    const button = this.expandButton.current;
    const container = this.container.current;
    if (this.props.screenWidth >= 1024 && button && container) {
      // The measuring render shows the trigger. Reclaim its space only when
      // every link fits without a disclosure; otherwise use the actual list.
      const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0;
      const widthWithoutButton = availableWidth + button.offsetWidth + gap;
      const totalWidth = widths.reduce((total, width) => total + width, 0);
      if (totalWidth <= widthWithoutButton) availableWidth = widthWithoutButton;
    }
    this.setState({
      hiddenIndexes: getOverflowedIndexes(widths, availableWidth),
      measuring: false,
    });
  };

  toggleMenu = () => {
    this.setState((prevState) => ({ open: !prevState.open }));
  };

  handleOutsidePointer = (event: PointerEvent) => {
    if (
      this.state.open &&
      event.target instanceof Node &&
      !this.container.current?.contains(event.target)
    ) {
      this.setState({ open: false });
    }
  };

  handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      this.setState({ open: false });
    }
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && this.state.open) {
      event.preventDefault();
      this.setState({ open: false });
      this.expandButton.current?.focus();
    }
  };

  render() {
    const { screenWidth } = this.props;
    const { open, hiddenIndexes, measuring } = this.state;
    const items = this.items;

    return (
      <React.Fragment>
        <nav
          className={`menu ${styles.menu} ${open ? `open ${styles.open}` : ''}`}
          rel="js-menu"
          ref={this.container}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        >
          <ul
            id="navigation-links"
            className={`itemList ${styles.itemList}`}
            ref={this.itemList}
          >
            {items.map((item, i) => (
              <Item
                item={item}
                key={item.to || i}
                overflowHidden={
                  hiddenIndexes.includes(i) && !(open && screenWidth < 1024)
                }
              />
            ))}
          </ul>
          {(hiddenIndexes.length > 0 || (measuring && screenWidth >= 1024)) && (
            <Expand
              onClick={this.toggleMenu}
              open={open}
              ref={this.expandButton}
              controls={
                screenWidth >= 1024 ? 'navigation-overflow' : 'navigation-links'
              }
            />
          )}
          {screenWidth >= 1024 && (
            <ul
              id="navigation-overflow"
              className={`hiddenItemList ${styles.hiddenItemList}`}
              hidden={!open}
            >
              {hiddenIndexes.map((index) => {
                const item = items[index];
                return item ? (
                  <Item item={item} key={item.to} hiddenItem />
                ) : null;
              })}
            </ul>
          )}

          <LanguagePicker />
          <ThemePicker />
        </nav>
      </React.Fragment>
    );
  }
}

export default Menu;
