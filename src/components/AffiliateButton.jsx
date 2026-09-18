import ViewOnAmazonButton from './ViewOnAmazonButton';

export default function AffiliateButton({ url, label = 'View on Amazon', className = '' }) {
  return <ViewOnAmazonButton url={url} label={label} className={className} />;
}
